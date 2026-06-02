import express from 'express';
import authController from '../controllers/auth.controller.js';

const authRouter = express.Router();

/**
 * - Route for user registration
 * @route POST /api/auth/register
 * @access Public
 */
authRouter.post("/register", authController.userRegisterController);

/**
 * - Route for user login
 * @route POST /api/auth/login
 * @access Public
 */
authRouter.post("/login", authController.userLoginController);

/**
 * - Route for user logout
 * @route POST /api/auth/logout
 * @access Private (requires authentication)
 */
authRouter.post("/logout", authController.userLogoutController);

// Additional authentication routes (e.g., logout, refresh token) can be added here
export default authRouter;
