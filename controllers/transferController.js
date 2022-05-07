import chalk from "chalk";

import { db } from "./../server/mongoClient.js";
import { SUCCESS, ERROR } from "./../models/blueprint/chalk.js";

export async function newTransfer(_req, res) {
  const from = res.locals.user.email;
  const { to, description, amount } = res.locals;

  const newTransfer = {
    from,
    to,
    description,
    amount,
    date: new Date(),
  };

  try {
    await db.collection("transfers").insertOne(newTransfer);
    console.log(chalk.green(`${SUCCESS} Transfer created`));

    try {
      await db.collection("accounts").updateOne(
        {
          email: from,
        },
        {
          $inc: {
            transactions_count: 1,
            balance: -amount,
          },
          $push: {
            user_transactions: newTransfer,
          },
        }
      );
      console.log(chalk.green(`${SUCCESS} user balance updated`));
      await db.collection("accounts").updateOne(
        {
          email: to,
        },
        {
          $inc: {
            transactions_count: 1,
            balance: amount,
          },
          $push: {
            user_transactions: newTransfer,
          },
        }
      );
      console.log(chalk.green(`${SUCCESS} target user balance updated`));
      res.sendStatus(200);
    } catch (err) {
      console.log(chalk.red(`${ERROR} ${err}`));
      return res.status(500).send({
        message: "Internal error while creating transaction",
        detail: err,
      });
    }
  } catch (err) {
    console.log(chalk.red(`${ERROR} ${err}`));
    return res.status(500).send({
      message: "Internal error while creating transfer",
      detail: err,
    });
  }
}
