import chalk from "chalk";

import { db } from "./../server/mongoClient.js";
import { ERROR } from "./../models/blueprint/chalk.js";

export default async function hasEnoughBalance(req, res, next) {
  const email = res.locals.user.email;
  const { amount, type } = res.locals;

  if (type === "withdrawal") {
    const user = await db.collection("users").findOne({ email });
    if (user.balance - amount < 0) {
      console.log(chalk.red(`${ERROR} Insufficient balance`));
      return res.status(422).send({
        message: "Insufficient balance",
        details: "You don't have enough balance to withdraw this amount",
      });
    }
  }
  next();
}
