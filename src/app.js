import express, { json } from "express";
import cors from "cors";
import chalk from "chalk";
import dotenv from "dotenv";

import { signup, signin } from "./controllers/authController.js";
import { getUsers } from "./controllers/userController.js";

export const DB_INFO = chalk.bold.blue("[Database]");
export const ERROR = chalk.bold.red("[ERROR]");
export const SERVER_INFO = chalk.bold.yellow("[Server]");

dotenv.config();
const app = express().use(json()).use(cors());
const PORT = process.env.PORT || 5000;

app.post(process.env.SIGNUP, signup);

app.post(process.env.SIGNIN, signin);

app.get(process.env.GET_USERS, getUsers);

app.listen(PORT, () => {
  console.log(
    chalk.bold.yellow(
      `${SERVER_INFO} Server started on port ${chalk.bold.yellow(PORT)}`
    )
  );
});
