import express from "express";
import dotenv from "dotenv";
dotenv.config();

import validateToken from "./../middleware/validateToken.js";
import requireToken from "./../middleware/requireToken.js";
import * as transaction from "./../controllers/transactionController.js";

const transactionRouter = express.Router();
transactionRouter.get(
  process.env.GET_TRANSACTIONS,
  requireToken,
  validateToken,
  transaction.getAll
);
export default transactionRouter;
