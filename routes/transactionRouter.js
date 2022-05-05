import express from "express";
import dotenv from "dotenv";
import * as transaction from "./../controllers/transactionController.js";
dotenv.config();

const transactionRouter = express.Router();
transactionRouter.get(process.env.GET_TRANSACTIONS, transaction.getAll);
export default transactionRouter;
