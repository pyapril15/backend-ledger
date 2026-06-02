import accountModel from '../models/account.model.js';

/**
 * - Controller for creating a new account
 * - Route: POST /api/accounts
 * - Description: Creates a new account for the authenticated user
 * - Access: Private (requires authentication)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @return {void}
 */
const createAccountController = async (req, res) => {
  try {
    const user = req.user;
    const account = await accountModel.create({ user: user._id });
    res.status(201).json(account);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * - Controller for fetching all accounts of the authenticated user
 * - Route: GET /api/accounts
 * - Description: Fetches all accounts associated with the authenticated user
 * - Access: Private (requires authentication)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @return {void}
 */
const getUserAccountsController = async (req, res) => {
  try {
    const user = req.user;
    const accounts = await accountModel.find({ user: user._id });
    res.status(200).json(accounts);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * - Controller for fetching the balance of a specific account
 * - Route: GET /api/accounts/balance/:accountId
 * - Description: Fetches the balance of a specific account for the authenticated user
 * - Access: Private (requires authentication)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @return {void}
 */
const getAccountBalanceController = async (req, res) => {
  try {
    const user = req.user;
    const { accountId } = req.params;
    const account = await accountModel.findOne({ _id: accountId, user: user._id });
    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    const balance = await account.getBalance();
    res.status(200).json({ accountId: account._id, balance: balance });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Exporting the controller functions as an object
export default {
  createAccountController,
  getUserAccountsController,
  getAccountBalanceController
};
