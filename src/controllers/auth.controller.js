import userModel from '../models/user.model.js';
import jwt from 'jsonwebtoken';
import emailService from '../services/email.service.js';
import tokenBlacklistModel from '../models/blackList.model.js';

/**
 * - Controller for user registration
 * - Route: POST /api/auth/register
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @return {void}
 */
async function userRegisterController(req, res) {
    const { name, email, password } = req.body;

    const isUserExist = await userModel.findOne({
        email: email
    });

    if (isUserExist) {
        return res.status(400).json({
            message: "User already exists",
            status: "failed"
        });
    }

    const newUser = await userModel.create({
        name, email, password
    });

    const token = jwt.sign(
        { id: newUser._id },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );

    res.cookie("token", token, { httpOnly: true });

    res.status(201).json({
        message: "User created successfully",
        status: "success",
        data: {
            id: newUser._id,
            name: newUser.name,
            email: newUser.email
        },
        token
    });

    // Send registration email
    await emailService.sendRegistrationEmail(newUser.email, newUser.name);
}

/**
 * - Controller for user login
 * - Route: POST /api/auth/login
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @return {void}
 */
async function userLoginController(req, res) {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email }).select('+password');

    if (!user) {
        return res.status(400).json({
            message: "Invalid email or password",
            status: "failed"
        });
    }

    const isPasswordCorrect = await user.comparePassword(password);

    if (!isPasswordCorrect) {
        return res.status(400).json({
            message: "Invalid email or password",
            status: "failed"
        });
    }

    const token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );

    res.cookie("token", token, { httpOnly: true });

    res.status(200).json({
        message: "User logged in successfully",
        status: "success",
        data: {
            id: user._id,
            name: user.name,
            email: user.email
        },
        token
    });
}

/**
 * - Controller for user logout
 * - Route: POST /api/auth/logout
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @return {void}
 */
async function userLogoutController(req, res) {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(400).json({
            message: "User is not logged in",
            status: "failed"
        });
    }

    res.clearCookie("token");

    // Add the token to the blacklist
    await tokenBlacklistModel.create({ token: token });

    res.status(200).json({
        message: "User logged out successfully",
        status: "success"
    });
}

// Exporting the controller functions as an object
export default {
    userRegisterController,
    userLoginController,
    userLogoutController
};
