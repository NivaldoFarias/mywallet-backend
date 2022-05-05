import express, { json } from "express";
import cors from "cors";
import chalk from "chalk";
import dotenv from "dotenv";

import * as auth from "./controllers/authController.js";
import * as user from "./controllers/userController.js";
import * as transaction from "./controllers/transactionController.js";
import { SERVER_INFO } from "./blueprints/chalk.js";

dotenv.config();
const app = express().use(json()).use(cors());
const PORT = process.env.PORT || 5000;

app.post(process.env.SIGNUP, auth.signup);

app.post(process.env.SIGNIN, auth.signin);

app.get(process.env.GET_USERS, user.getAll);

app.get(process.env.GET_TRANSACTIONS, transaction.getAll);

app.listen(PORT, () => {
  console.log(
    chalk.bold.yellow(
      `${SERVER_INFO} Server started on port ${chalk.bold.yellow(PORT)}`
    )
  );
});
