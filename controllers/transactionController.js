import chalk from "chalk";

import { db } from "./../server/mongoClient.js";
import { ERROR } from "../models/blueprint/chalk.js";

export async function getAll(_req, res) {
  const token = res.locals.token;
  const user = res.locals.user;

  try {
    await db.collection("sessions").updateOne(
      {
        token: token,
      },
      {
        $set: {
          active: true,
          last_login: new Date(),
        },
      }
    );
    const transactions = await db
      .collection("transactions")
      .find({ email: user.email })
      .toArray();
    res.send(transactions.user_transactions);
  } catch (err) {
    console.log(chalk.red(`${ERROR} ${err}`));
    return res.status(500).send({
      message: "Internal error while getting transactions",
      detail: err,
    });
  }
}
