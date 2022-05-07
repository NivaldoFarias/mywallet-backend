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
  process.env.GET_TRANSACTIONS,
  validateToken,
  transaction.getAll
);
transactionRouter.post(
  process.env.NEW_TRANSACTION,
  validateTransaction,
  hasEnoughBalance,
  transaction.newTransaction
);

export default transactionRouter;
