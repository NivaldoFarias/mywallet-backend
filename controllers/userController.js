import chalk from "chalk";
import { ERROR } from "./../app.js";
import { database } from "./../server/mongoClient.js";

export async function getUsers(_req, res) {
  try {
    const users = await database.collection("accounts").find().toArray();
    res.send(users);
  } catch (err) {
    console.log(chalk.red(`${ERROR} ${err}`));
    res.status(500).send(err);
  }
}
