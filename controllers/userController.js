import chalk from "chalk";
import { db } from "./../server/mongoClient.js";
import { ERROR } from "../models/blueprint/chalk.js";

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

export async function getBalance(_req, res) {
  const user = res.locals.user;

  try {
    const queryUser = await db
      .collection("accounts")
      .findOne({ email: user.email });
    res.send({ balance: queryUser.balance });
  } catch (err) {
    console.log(chalk.red(`${ERROR} ${err}`));
    return res.status(500).send({
      message: "Internal error while getting balance",
      detail: err,
    });
  }
}
