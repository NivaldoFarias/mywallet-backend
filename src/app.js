import express, { json } from "express";
import { MongoClient, ServerApiVersion } from "mongodb";
import cors from "cors";
import chalk from "chalk";
import dotenv from "dotenv";

import { signup, login } from "./controllers/authController.js";
import { getUsers } from "./controllers/userController.js";

export let database = null;
export const DB_INFO = chalk.bold.blue("[Database]");
export const ERROR = chalk.bold.red("[ERROR]");

dotenv.config();

const app = express().use(json()).use(cors());
const URI = process.env.MONGODB_URI;
const PORT = process.env.PORT || 5000;
const SIGNUP = process.env.SIGNUP;
const LOGIN = process.env.LOGIN;
const GET_USERS = process.env.GET_USERS;
const SERVER_INFO = chalk.bold.yellow("[Server]");
const mongoClient = new MongoClient(URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
mongoClient.connect(() => {
  database = mongoClient.db("mywallet");
  console.log(
    chalk.blue(
      `${DB_INFO} Connected to database ${chalk.bold.blue(
        database.databaseName
      )}`
    )
  );
});

app.post(SIGNUP, signup);

app.post(LOGIN, login);

app.get(GET_USERS, getUsers);

app.listen(PORT, () => {
  console.log(
    chalk.bold.yellow(
      `${SERVER_INFO} Server started on port ${chalk.bold.yellow(PORT)}`
    )
  );
});
