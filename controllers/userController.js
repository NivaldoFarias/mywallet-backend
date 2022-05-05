import chalk from "chalk";
import { db } from "./../server/mongoClient.js";
import { ERROR } from "./../blueprints/chalk.js";

export async function getAll(_req, res) {
  try {
    const users = await db.collection("accounts").find().toArray();
    res.send(users);
  } catch (err) {
    console.log(chalk.red(`${ERROR} ${err}`));
    res.status(500).send({
      message: "Internal error while getting users",
      detail: err,
    });
  }
}
