import chalk from "chalk";

import { db } from "./../server/mongoClient.js";
import { ERROR } from "./../models/blueprint/chalk.js";

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
    /* const transactions = await db
      .collection("transactions")
      .find({ $or: [{ from: user.email }, { to: user.email }] })
      .toArray(); */
    res.send(transactions);
  } catch (err) {
    console.log(chalk.red(`${ERROR} ${err}`));
    return res.status(500).send({
      message: "Internal error while getting transactions",
      detail: err,
    });
  }
}

export async function newTransaction(_req, res) {
  const email = res.locals.user.email;
  const { amount, description, type } = res.locals;

  const newTransaction = {
    email,
    type,
    description,
    amount,
    date: new Date(),
  };

  try {
    await db.collection("transactions").insertOne(newTransaction);

    let operationValue = null;
    if (type === "withdrawal") operationValue = -amount;
    else operationValue = amount;

    await db.collection("accounts").updateOne(
      {
        email: email,
      },
      {
        $inc: {
          transactions_count: 1,
          balance: operationValue,
        },
        $push: {
          user_transactions: newTransaction,
        },
      }
    );

    res.sendStatus(200);
  } catch (err) {
    console.log(chalk.red(`${ERROR} ${err}`));
    return res.status(500).send({
      message: "Internal error while creating transaction",
      detail: err,
    });
  }
}
