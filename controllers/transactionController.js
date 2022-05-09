import chalk from "chalk";

import { db } from "./../server/mongoClient.js";
import { SUCCESS, ERROR } from "./../models/blueprint/chalk.js";

export async function userTransactions(_req, res) {
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

    const queryUser = await db
      .collection("accounts")
      .findOne({ email: user.email });
    res.send(queryUser.user_transactions);
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

    console.log(chalk.green(`${SUCCESS} Transaction added`));
    res.sendStatus(200);
  } catch (err) {
    console.log(chalk.red(`${ERROR} ${err}`));
    return res.status(500).send({
      message: "Internal error while creating transaction",
      detail: err,
    });
  }
}

export async function deleteTransaction(req, res) {
  const id = req.body.transaction_id;
  const email = res.locals.user.email;

  try {
    await db.collection("transactions").deleteOne({ _id: id });
    await db.collection("accounts").updateOne(
      {
        email: email,
      },
      {
        $inc: {
          transactions_count: -1,
        },
        $pull: {
          user_transactions: {
            _id: id,
          },
        },
      }
    );
    console.log(chalk.green(`${SUCCESS} Transaction deleted`));
    res.sendStatus(200);
  } catch (err) {
    console.log(chalk.red(`${ERROR} ${err}`));
    return res.status(500).send({
      message: "Internal error while deleting transaction",
      detail: err,
    });
  }
}

export async function updateTransaction(req, res) {
  const id = req.body.transaction_id;
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
    await db.collection("transactions").updateOne(
      {
        _id: id,
      },
      {
        $set: newTransaction,
      }
    );

    try {
      await db.collection("accounts").updateOne(
        {
          email: email,
        },
        {
          $pull: {
            user_transactions: {
              _id: id,
            },
          },
        }
      );
      await db.collection("accounts").updateOne(
        {
          email: email,
        },
        {
          $push: {
            user_transactions: newTransaction,
          },
        }
      );
      console.log(chalk.green(`${SUCCESS} Transaction updated`));
      res.sendStatus(200);
    } catch (err) {
      console.log(chalk.red(`${ERROR} ${err}`));
      return res.status(500).send({
        message: "Internal error while updating transaction",
        detail: err,
      });
    }
  } catch (err) {
    console.log(chalk.red(`${ERROR} ${err}`));
    return res.status(500).send({
      message: "Internal error while updating transaction",
      detail: err,
    });
  }
}
