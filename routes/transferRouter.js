import express from "express";
import dotenv from "dotenv";
dotenv.config();

import validateTransfer from "./../middleware/validateTransfer.js";
import hasEnoughBalance from "./../middleware/hasEnoughBalance.js";
import targetAccountExists from "./../middleware/targetAccountExists.js";

import * as transfer from "./../controllers/transferController.js";

const transferRouter = express.Router();
transferRouter.get(process.env.USER_TRANSFERS, transfer.userTransfers);
transferRouter.post(
  process.env.NEW_TRANSFER,
  validateTransfer,
  hasEnoughBalance,
  targetAccountExists,
  transfer.newTransfer
);
transferRouter.delete(process.env.DELETE_TRANSFER, transfer.deleteTransfer);
transferRouter.put(
  process.env.UPDATE_TRANSFER,
  validateTransfer,
  hasEnoughBalance,
  targetAccountExists,
  transfer.updateTransfer
);

export default transferRouter;
