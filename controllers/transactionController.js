import chalk from "chalk";
import { ObjectId } from "mongodb";

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
  const id = req.params.transaction_id;
  const email = res.locals.user.email;
  let operationValue = null;

  try {
    const transaction = await db
      .collection("transactions")
      .findOne({ _id: new ObjectId(id) });
    if (!transaction) {
      console.log(
        chalk.red(`${ERROR} Transaction ${chalk.bold(id)} does not exist`)
      );
      return res.status(404).send({
        message: "Transaction does not exist",
        detail: `Transaction ${id} does not exist`,
      });
    } else {
      if (transaction.type === "withdrawal")
        operationValue = transaction.amount;
      else operationValue = -transaction.amount;
    }
  } catch (err) {
    console.log(chalk.red(`${ERROR} ${err}`));
    return res.status(500).send({
      message: "Internal error while deleting transaction",
      detail: err,
    });
  }

  try {
    await db.collection("transactions").deleteOne({ _id: new ObjectId(id) });
    await db.collection("accounts").updateOne(
      {
        email: email,
      },
      {
        $inc: {
          transactions_count: -1,
          balance: operationValue,
        },
        $pull: {
          user_transactions: {
            _id: new ObjectId(id),
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
  const id = req.params.transaction_id;
  const email = res.locals.user.email;
  const { amount, description, type } = res.locals;
  let operationValue = null;
  let diffValue = null;

  const newTransaction = {
    email,
    type,
    description,
    amount,
    date: new Date(),
  };

  try {
    const transaction = await db
      .collection("transactions")
      .findOne({ _id: new ObjectId(id) });
    if (!transaction) {
      console.log(
        chalk.red(`${ERROR} Transaction ${chalk.bold(id)} does not exist`)
      );
      return res.status(404).send({
        message: "Transaction does not exist",
        detail: `Transaction ${id} does not exist`,
      });
    } else {
      if (type === "withdrawal") operationValue = amount;
      else operationValue = -amount;

      diffValue = operationValue - transaction.amount;
    }
  } catch (err) {
    console.log(chalk.red(`${ERROR} ${err}`));
    return res.status(500).send({
      message: "Internal error while updating transaction",
      detail: err,
    });
  }

  try {
    await db.collection("transactions").updateOne(
      {
        _id: new ObjectId(id),
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
          $inc: {
            balance: diffValue,
          },
          $pull: {
            user_transactions: {
              _id: new ObjectId(id),
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
