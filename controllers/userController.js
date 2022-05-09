import chalk from "chalk";
import { db } from "./../server/mongoClient.js";
import { ERROR } from "../models/blueprint/chalk.js";

export async function getAll(_req, res) {
  try {
    const users = await db.collection("accounts").find().toArray();
    res.send(
      users.map((user) => {
        return {
          name: user.name,
          email: user.email,
        };
      })
    );
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

export async function signoff(_req, res) {
  const email = res.locals.user.email;

  try {
    await db.collection("sessions").deleteOne({ email: email });
    res.sendStatus(200);
  } catch (err) {
    console.log(chalk.red(`${ERROR} ${err}`));
    return res.status(500).send({
      message: "Internal error while signing off user",
      detail: err,
    });
  }
}
