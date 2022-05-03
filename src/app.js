import express, { json } from "express";
import { MongoClient, ServerApiVersion } from "mongodb";
import cors from "cors";
import chalk from "chalk";
import dotenv from "dotenv";

import { postUser } from "./handlers/postUser.js";
import { getUsers } from "./handlers/getUsers.js";

export let database = null;
export const DB_INFO = chalk.bold.blue("[Database]");
export const ERROR = chalk.bold.red("[ERROR]");

dotenv.config();

const app = express().use(json()).use(cors());
const URI = process.env.MONGODB_URI;
const PORT = process.env.PORT || 5000;
const POST_USER = process.env.POST_USER;
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

app.get(GET_USERS, getUsers);

app.post(POST_USER, postUser);

app.listen(PORT, () => {
  console.log(
    `${SERVER_INFO} Server started on port ${chalk.bold.yellow(PORT)}`
  );
});
