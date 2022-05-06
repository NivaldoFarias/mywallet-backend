import chalk from "chalk";
import { ObjectId } from "mongodb";

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
      .findOne({ email: email });
    res.send(transactions.user_transactions);
  } catch (err) {
    console.log(chalk.red(`${ERROR} ${err}`));
    return res.status(500).send({
      message: "Internal error while getting transactions",
      detail: err,
    });
  }
}

export async function newTransaction(req, res) {
  const targetEmail = req.params.targetEmail;
  const transferType = req.params.transferType;
  const email = res.locals.user.email;
  const { amount, description, type } = req.body;
  const regexType = /(transfer|income|expense)/g;
  const regexTransfer = /(transfer|income|expense)/g;

  if (!type.match(regexType) || !amount || !description) {
    return res.status(400).send({
      message: "Missing parameterst",
      detail: "Ensure that all parameters are present",
    });
  }

  const newTransaction = {
    description: description,
    amount: amount,
    date: new Date(),
    transaction_id: new ObjectId(),
  };

  try {
    const transactions = await db
      .collection("transactions")
      .findOne({ email: email });

    if (type === "transfer") {
      if (!transferType.match(regexTransfer)) {
        return res.status(400).send({
          message: "Invalid transfer type",
          detail: "Ensure that the transfer type is valid",
        });
      }

      if (targetEmail === email) {
        return res.status(403).send({
          message: "You cannot transfer to yourself",
          detail:
            "Ensure that the target account is different than the source account",
        });
      }

      const targetUser = await db
        .collection("users")
        .findOne({ email: targetEmail });
      if (!targetUser) {
        return res.status(404).send({
          message: "User not found",
          detail: "Ensure that the user exists",
        });
      }

      await db.collection("transactions").updateOne(
        {
          email: targetEmail,
        },
        {
          $inc: {
            transactions_count: 1,
            balance: amount,
          },
          $set: {
            user_transactions: {
              transfer: [
                ...targetUser.user_transactions.transfer,
                {
                  ...newTransaction,
                  type: "entry",
                  action_email: email,
                },
              ],
            },
          },
        }
      );

      transactions.user_transactions.transfer.push({
        ...newTransaction,
        type: "send",
        action_email: targetEmail,
      });
    } else {
      transactions.user_transactions[type].push(newTransaction);
    }

    await db.collection("transactions").updateOne(
      {
        email: email,
      },
      {
        $inc: {
          transactions_count: 1,
          balance: amount,
        },
        $set: {
          user_transactions: transactions.user_transactions,
        },
      }
    );

    res.send(transactions.user_transactions);
  } catch (err) {
    console.log(chalk.red(`${ERROR} ${err}`));
    return res.status(500).send({
      message: "Internal error while creating transaction",
      detail: err,
    });
  }
}
