import chalk from "chalk";

import { db } from "./../server/mongoClient.js";
import { ERROR } from "./../models/blueprint/chalk.js";

export default async function targetAccountExists(_req, res, next) {
  const { to } = res.locals;

  try {
    const account = await db.collection("accounts").findOne({ email: to });
    if (!account) {
      console.log(chalk.red(`${ERROR} Account does not exist`));
      return res.status(404).send({
        message: "Account not found",
        detail: "The account you are trying to transfer to does not exist",
      });
    }
  } catch (err) {
    console.log(chalk.red(`${ERROR} ${err}`));
    return res.status(500).send({
      message: "Internal error while getting transactions",
      detail: err,
    });
  }
  next();
}
