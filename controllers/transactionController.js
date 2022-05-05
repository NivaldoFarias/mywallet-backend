import chalk from "chalk";
import { db } from "./../server/mongoClient.js";
import { ERROR } from "./../blueprints/chalk.js";

export async function getAll(_req, res) {
  try {
    const transactions = await db.collection("transactions").find().toArray();
    res.send(transactions);
  } catch (err) {
    console.log(chalk.red(`${ERROR} ${err}`));
    res.status(500).send(err);
  }
}
