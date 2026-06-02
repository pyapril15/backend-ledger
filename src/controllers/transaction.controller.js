import mongoose from 'mongoose';
import emailService from '../services/email.service.js';
import transactionModel from '../models/transaction.model.js';
import accountModel from '../models/account.model.js';
import ledgerModel from '../models/ledger.model.js';


/** 
 * Controller for handling transaction-related operations
 * - Route: POST /api/transactions
 * - Description: Creates a new transaction between two accounts with idempotency handling, balance checks, and email notifications.
 * - Access: Private (requires authentication)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @return {void}
 */
const createTransaction = async (req, res) => {

    // 1. Validate request body
    const { fromAccount, toAccount, amount, idempotencyKey } = req.body;

    if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    const fromUserAccount = await accountModel.findById(fromAccount);
    const toUserAccount = await accountModel.findById(toAccount);

    await fromUserAccount.populate('user');
    await toUserAccount.populate('user');

    if (!fromUserAccount || !toUserAccount) {
        return res.status(404).json({ message: 'Account not found' });
    }

    if (fromUserAccount.user._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Unauthorized to perform transaction from this account' });
    }

    // 2. Check for existing transaction with the same idempotency key
    const isTransactionAlreadyExists = await transactionModel.findOne({ idempotencyKey });

    if (isTransactionAlreadyExists) {
        if (isTransactionAlreadyExists.status === "COMPLETED") {
            return res.status(200).json({ message: 'Transaction completed successfully' });
        }

        if (isTransactionAlreadyExists.status === "PENDING") {
            return res.status(409).json({ message: 'Transaction is still in progress' });
        }

        if (isTransactionAlreadyExists.status === "FAILED") {
            return res.status(500).json({ message: 'Previous transaction attempt failed, please try again' });
        }

        if (isTransactionAlreadyExists.status === "REVERSED") {
            return res.status(500).json({ message: 'Previous transaction was reversed, please try again' });
        }
    }

    // 3. Check account status
    if (fromUserAccount.status !== "ACTIVE" || toUserAccount.status !== "ACTIVE") {
        return res.status(400).json({ message: 'One or both accounts are not active' });
    }

    // 4. Check for sufficient balance
    const balance = await fromUserAccount.getBalance();

    if (balance < amount) {
        return res.status(400).json({ message: 'Insufficient balance' });
    }

    // 5. Create transaction and ledger entries within a transaction session
    let transaction;
    try {
        const session = await mongoose.startSession();
        session.startTransaction();

        transaction = (await transactionModel.create([{
            fromAccount,
            toAccount,
            amount,
            idempotencyKey,
            status: "PENDING"
        }], { session }))[0];

        const debitLedgerEntry = await ledgerModel.create([{
            account: fromAccount,
            amount: amount,
            type: "DEBIT",
            transaction: transaction._id
        }], { session });

        await (() => { 
            return new Promise((resolve) => setTimeout(resolve, 15 * 1000))
        })(); // Simulate processing delay

        const creditLedgerEntry = await ledgerModel.create([{
            account: toAccount,
            amount: amount,
            type: "CREDIT",
            transaction: transaction._id
        }], { session });

        await transactionModel.findByIdAndUpdate(
            transaction._id,
            { status: "COMPLETED" },
            { session }
        );

        await session.commitTransaction();
        session.endSession();
    } catch (error) {
        return res.status(500).json({ message: 'Transaction is pending due to some issue, please try after some time', error: error.message });
    }

    // 6. Send email notifications
    const currency = fromUserAccount.currency === toUserAccount.currency ? fromUserAccount.currency : 'USD';
    await emailService.sendDebitTransactionEmail(fromUserAccount.user.email, fromUserAccount.user.name, currency, amount, toAccount);
    await emailService.sendCreditTransactionEmail(toUserAccount.user.email, toUserAccount.user.name, currency, amount, fromAccount);

    res.status(201).json({ message: 'Transaction completed successfully', transaction: transaction });
}

/**
 * Controller for creating an initial funds transaction from the system account to a user account
 * - Route: POST /api/transactions/system/initial-funds
 * - Description: Creates a transaction to fund a user's account from the system account, with idempotency handling and balance checks.
 * - Access: Private (requires authentication)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @return {void}
 */
const createInitialFundsTransaction = async (req, res) => {
    const { toAccount, amount, idempotencyKey } = req.body;

    if (!toAccount || !amount || !idempotencyKey) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    const toUserAccount = await accountModel.findById(toAccount);

    if (!toUserAccount) {
        return res.status(404).json({ message: 'Account not found' });
    }

    const fromUserAccount = await accountModel.findOne({ user: req.user._id });

    if (!fromUserAccount) {
        return res.status(500).json({ message: 'System account not found' });
    }

    let transaction;
    try {
        const session = await mongoose.startSession();
        session.startTransaction();

        transaction = (await transactionModel.create([{
            fromAccount: fromUserAccount._id,
            toAccount: toAccount,
            amount,
            idempotencyKey,
            status: "PENDING"
        }], { session }))[0];

        const debitLedgerEntry = await ledgerModel.create([{
            account: fromUserAccount._id,
            amount: amount,
            type: "DEBIT",
            transaction: transaction._id
        }], { session });

        await (() => { 
            return new Promise((resolve) => setTimeout(resolve, 15 * 1000))
        })(); // Simulate processing delay

        const creditLedgerEntry = await ledgerModel.create([{
            account: toAccount,
            amount: amount,
            type: "CREDIT",
            transaction: transaction._id
        }], { session });

        await transactionModel.findByIdAndUpdate(
            transaction._id,
            { status: "COMPLETED" },
            { session }
        );

        await session.commitTransaction();
        session.endSession();
    } catch (error) {
        return res.status(500).json({ message: 'Transaction is pending due to some issue, please try after some time', error: error.message });
    }

    return res.status(201).json({ message: 'Initial funds transaction completed successfully', transaction: transaction });
}

export default {
    createTransaction,
    createInitialFundsTransaction
}