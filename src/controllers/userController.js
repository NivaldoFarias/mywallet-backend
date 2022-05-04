import chalk from "chalk";
import { database, ERROR } from "../app.js";

export async function getUsers(_req, res) {
  try {
    const users = await database.collection("accounts").find().toArray();
    res.send(users);
  } catch (err) {
    console.log(chalk.red(`${ERROR} ${err}`));
    res.status(500).send(err);
  }
}
