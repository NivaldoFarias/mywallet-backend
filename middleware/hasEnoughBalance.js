import chalk from "chalk";

import { db } from "./../server/mongoClient.js";
import { ERROR } from "./../models/blueprint/chalk.js";

export default async function hasEnoughBalance(_req, res, next) {
  const email = res.locals.user.email;
  const { amount } = res.locals;

  if ((res.locals.type === "withdrawal" && amount > 0) || res.locals.to) {
    try {
      const user = await db.collection("accounts").findOne({ email });
      if (user.balance - amount < 0) {
        console.log(chalk.red(`${ERROR} Insufficient balance`));
        return res.status(422).send({
          message: "Insufficient balance",
          details: "You don't have enough balance to withdraw this amount",
        });
      }
    } catch (err) {
      console.log(chalk.red(`${ERROR} ${err}`));
      return res.status(500).send({
        message: "Internal error while getting transactions",
        detail: err,
      });
    }
  }
  next();
}
