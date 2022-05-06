import express from "express";
import dotenv from "dotenv";
dotenv.config();

import validateToken from "./../middleware/validateToken.js";
import requireToken from "./../middleware/requireToken.js";
import * as transaction from "./../controllers/transactionController.js";

const transactionRouter = express.Router();
transactionRouter.use(requireToken);
transactionRouter.get(
  process.env.GET_TRANSACTIONS,
  validateToken,
  transaction.getAll
);
transactionRouter.post(process.env.NEW_TRANSACTION, transaction.newTransaction);
export default transactionRouter;
