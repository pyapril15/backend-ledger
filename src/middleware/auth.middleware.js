import userModel from '../models/user.model.js';
import jwt from 'jsonwebtoken';
import tokenBlacklistModel from '../models/blackList.model.js';

/**
 * Middleware to authenticate users
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function authMiddleware(req, res, next) {
    // Check for token in cookies or Authorization header
    const token = req.cookies.token || req.headers['authorization']?.split(' ')[1];

    // If no token is found, return unauthorized error
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized access, no token provided' });
    }

    // Check if the token is in the blacklist
    const isBlacklisted = await tokenBlacklistModel.findOne({ token });
    if (isBlacklisted) {
        return res.status(401).json({ message: 'Unauthorized access, token has been revoked' });
    }

    // Verify the token and extract user information
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findById(decoded.id);
        if (!user) {
            return res.status(401).json({ message: 'Unauthorized access, invalid token' });
        }
        req.user = user;
        next();
    } catch (error) {
        res.status(500).json({ message: 'Unauthorized access, invalid token', error: error.message });
    }
}

/**
 * Middleware to authenticate system users
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function authSystemUserMiddleware(req, res, next) {
    // Check for token in cookies or Authorization header
    const token = req.cookies.token || req.headers['authorization']?.split(' ')[1];

    // If no token is found, return unauthorized error
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized access, no token provided' });
    }

    // Check if the token is in the blacklist
    const isBlacklisted = await tokenBlacklistModel.findOne({ token });
    if (isBlacklisted) {
        return res.status(401).json({ message: 'Unauthorized access, token has been revoked' });
    }

    // Verify the token and extract user information
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findById(decoded.id).select('+systemUser');

        if (!user.systemUser) {
            return res.status(403).json({ message: 'Forbidden access, only system users can perform this action' });
        }
        req.user = user;
        next();
    } catch (error) {
        res.status(500).json({ message: 'Unauthorized access, invalid token', error: error.message });
    }
}

export default { authMiddleware, authSystemUserMiddleware };
