import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import transactionController from "../controllers/transaction.controller.js";

const transactionRouter = express.Router();

/**
 * - Route for creating a new transaction
 * @route POST /api/transactions
 * @access Private (requires authentication)
 */
transactionRouter.post("/", authMiddleware.authMiddleware, transactionController.createTransaction);

/**
 * - Route for creating an initial funds transaction from the system account to a user account
 * @route POST /api/transactions/system/initial-funds
 * @access Private (requires authentication)
 */
transactionRouter.post("/system/initial-funds", authMiddleware.authSystemUserMiddleware, transactionController.createInitialFundsTransaction);

export default transactionRouter;
