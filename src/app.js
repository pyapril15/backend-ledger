// const express = require('express');
import express from 'express';
import cookieParser from 'cookie-parser';
import authRouter from './routes/auth.routes.js';
import accountRouter from './routes/account.routes.js';
import transactionRouter from './routes/transaction.routes.js';

// const app = express();
const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());

// Routes
app.get('/', (req, res) => {
  res.send('Welcome to the Banking API');
});
app.use('/api/auth', authRouter);
app.use('/api/accounts', accountRouter);
app.use('/api/transactions', transactionRouter);

// module.exports = app;
export default app;
