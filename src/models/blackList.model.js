import mongoose from 'mongoose';

const tokenBlackListSchema = new mongoose.Schema({
    token: {
        type: String,
        required: [true, 'Token is required to be blacklisted'],
        unique: [true, 'Token is already blacklisted']
    },

    blacklistedAt: {
        type: Date,
        default: Date.now,
        immutable: true
    }
}, {
    timestamps: true
});

tokenBlackListSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 }); // Expire after 1 hour

const tokenBlackListModel = mongoose.model('tokenBlackList', tokenBlackListSchema);
export default tokenBlackListModel;