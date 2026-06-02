import express from 'express';
import authMiddleware from '../middleware/auth.middleware.js';
import accountController from '../controllers/account.controller.js';

const accountRouter = express.Router();

/**
 * - Account Routes
 * - All routes are protected and require authentication
 * @route POST /api/accounts
 * @desc Create a new account
 * @access Private
 */
accountRouter.post('/', authMiddleware.authMiddleware, accountController.createAccountController);

/**
 * - Account Routes
 * - All routes are protected and require authentication
 * @route GET /api/accounts
 * @desc Get all accounts for the authenticated user
 * @access Private
 */
accountRouter.get('/', authMiddleware.authMiddleware, accountController.getUserAccountsController);

/**
 * - Account Routes
 * - All routes are protected and require authentication
 * @route GET /api/accounts/balance/:accountId
 * @desc Get the balance of a specific account for the authenticated user
 * @access Private
 */
accountRouter.get('/balance/:accountId', authMiddleware.authMiddleware, accountController.getAccountBalanceController);

// Additional account routes (e.g., get account details, update account, delete account) can be added here
export default accountRouter;