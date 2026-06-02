import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
    fromAccount: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'account',
        required: [true, 'From account is required'],
        index: true
    },

    toAccount: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'account',
        required: [true, 'To account is required'],
        index: true
    },

    status: {
        type: String,
        enum: {
            values: ['PENDING', 'COMPLETED', 'FAILED', 'REVERSED'],
            message: 'Invalid status value'
        },
        default: 'PENDING'
    },

    amount: {
        type: Number,
        required: [true, 'Amount is required'],
        min: [0.01, 'Amount must be greater than zero']
    },

    idempotencyKey: {
        type: String,
        required: [true, 'Idempotency key is required'],
        unique: true,
        index: true
    }
}, {
    timestamps: true
});

const transactionModel = mongoose.model('transaction', transactionSchema);
export default transactionModel;