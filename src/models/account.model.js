import mongoose from 'mongoose';
import ledgerModel from './ledger.model.js';

// Define the Account schema with fields for user reference, status, and currency, including validation and indexing for efficient querying
const accountSchema = new mongoose.Schema({
    // Define the user field as a reference to the User model, with validation and indexing for efficient querying
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref : 'user',
        required: [true, 'User is required'],
        index: true
    },

    // Define the status field with enumeration for valid values and a default value
    status: {
        type: String,
        enum: { 
            values: ['ACTIVE', 'FROZEN', 'CLOSED'],
            message: '{VALUE} is not a valid status'
        },
        default: 'ACTIVE'
    },

    // Define the currency field with validation and a default value
    currency: {
        type: String,
        required: [true, 'Currency is required'],
        default: 'INR'
    },
}, {
    timestamps: true
});

// Create a compound index on the user and status fields to optimize queries that filter by these fields
accountSchema.index({ user: 1, status: 1 });

// Define an instance method on the Account schema to calculate the current balance by aggregating debit and credit transactions from the ledger
accountSchema.methods.getBalance = async function() {
    // Use MongoDB's aggregation framework to calculate the total debit and credit amounts for the account, and compute the balance by subtracting total debit from total credit
    const balanceData = await ledgerModel.aggregate([
        // Match ledger entries for the current account
        { $match: { account: this._id } },

        // Group the matched entries to calculate total debit and credit amounts
        {
            $group: {
                // Group by null to aggregate all matching entries into a single result, and calculate total debit and credit using conditional aggregation
                _id: null,
                // Use conditional aggregation to sum debit and credit amounts separately
                totalDebit: {
                    $sum: {
                        $cond: [
                            // Check if the transaction type is 'DEBIT' and sum the amount, otherwise add 0
                            { $eq: ['$type', 'DEBIT'] },
                            '$amount',
                            0
                        ]
                    }
                },
                // Use conditional aggregation to sum credit amounts
                totalCredit: {
                    $sum: {
                        $cond: [
                            // Check if the transaction type is 'CREDIT' and sum the amount, otherwise add 0
                            { $eq: ['$type', 'CREDIT'] },
                            '$amount',
                            0
                        ]
                    }
                }
            }
        },

        // Project the final balance by subtracting total debit from total credit, and exclude the _id field from the result
        {
            $project: {
                // Exclude the _id field from the result and calculate the balance by subtracting total debit from total credit
                _id: 0,
                balance: { $subtract: ['$totalCredit', '$totalDebit'] }
            }
        }
    ]);

    // Return the calculated balance if available, otherwise return 0 if there are no transactions for the account
    return balanceData.length > 0 ? balanceData[0].balance : 0;
};

// Create and export the Account model based on the defined schema
const accountModel = mongoose.model('account', accountSchema);
export default accountModel;
