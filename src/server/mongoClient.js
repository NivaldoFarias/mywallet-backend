import chalk from "chalk";
import { MongoClient, ServerApiVersion } from "mongodb";
import { DB_INFO } from "./../app.js";

import dotenv from "dotenv";
dotenv.config();

export let database = null;
const mongoClient = new MongoClient(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
try {
  await mongoClient.connect();
  database = mongoClient.db(process.env.DATABASE);
  console.log(
    chalk.blue(
      `${DB_INFO} Connected to database ${chalk.bold.blue(
        database.databaseName
      )}`
    )
  );
} catch (err) {
  console.log(chalk.red(`${ERROR} ${err}`));
}
