import express from "express";
import dotenv from "dotenv";
dotenv.config();

import requireToken from "./../middleware/requireToken.js";
import validateToken from "./../middleware/validateToken.js";
import validateTransaction from "./../middleware/validateTransaction.js";
import hasEnoughBalance from "./../middleware/hasEnoughBalance.js";

import * as transaction from "./../controllers/transactionController.js";

const transactionRouter = express.Router();
transactionRouter.use(requireToken);
transactionRouter.get(
  process.env.USER_TRANSACTIONS,
  validateToken,
  transaction.userTransactions
);
transactionRouter.post(
  process.env.NEW_TRANSACTION,
  validateTransaction,
  hasEnoughBalance,
  transaction.newTransaction
);
transactionRouter.delete(
  process.env.DELETE_TRANSACTION,
  transaction.deleteTransaction
);
transactionRouter.put(
  process.env.UPDATE_TRANSACTION,
  transaction.updateTransaction
);

export default transactionRouter;
