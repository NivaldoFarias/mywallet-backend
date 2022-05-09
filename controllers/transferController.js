import { ObjectId } from "mongodb";
import chalk from "chalk";

import { db } from "./../server/mongoClient.js";
import { SUCCESS, ERROR } from "./../models/blueprint/chalk.js";

export async function userTransfers(_req, res) {
  const user = res.locals.user;

  try {
    const queryUser = await db
      .collection("accounts")
      .findOne({ email: user.email });
    const transfers = queryUser.user_transactions.filter((transfers) => {
      return transfers.to;
    });

    res.send(transfers);
  } catch (err) {
    console.log(chalk.red(`${ERROR} ${err}`));
    return res.status(500).send({
      message: "Internal error while getting transactions",
      detail: err,
    });
  }
}

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

  if (to === from) {
    return res.status(400).send({
      message: "You can't transfer to yourself",
    });
  }

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
        message: "Internal error while creating transfers",
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

export async function updateTransfer(req, res) {
  const id = req.params.transfer_id;
  const from = res.locals.user.email;
  const { to, description, amount } = res.locals;
  let diffValue = null;

  const newTransfer = {
    from,
    to,
    description,
    amount,
    date: new Date(),
  };

  if (to === from) {
    return res.status(400).send({
      message: "You can't transfer to yourself",
    });
  }

  try {
    const transfer = await db
      .collection("transfers")
      .findOne({ _id: new ObjectId(id) });
    if (!transfer) {
      console.log(
        chalk.red(`${ERROR} Transfer ${chalk.bold(id)} does not exist`)
      );
      return res.status(404).send({
        message: "Transfer does not exist",
        detail: `Transfer ${id} does not exist`,
      });
    } else {
      diffValue = transfer.amount - amount;
    }
  } catch (err) {
    console.log(chalk.red(`${ERROR} ${err}`));
    return res.status(500).send({
      message: "Internal error while updating transfer",
      detail: err,
    });
  }

  try {
    await db.collection("transfers").updateOne(
      {
        _id: new ObjectId(id),
      },
      {
        $set: newTransfer,
      }
    );

    try {
      await db.collection("accounts").updateOne(
        {
          from: from,
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
          from: from,
        },
        {
          $push: {
            user_transactions: newTransfer,
          },
        }
      );
      console.log(chalk.green(`${SUCCESS} Transfer updated`));
      res.sendStatus(200);
    } catch (err) {
      console.log(chalk.red(`${ERROR} ${err}`));
      return res.status(500).send({
        message: "Internal error while updating transfer",
        detail: err,
      });
    }
  } catch (err) {
    console.log(chalk.red(`${ERROR} ${err}`));
    return res.status(500).send({
      message: "Internal error while updating transfer",
      detail: err,
    });
  }
}
