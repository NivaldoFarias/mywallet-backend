import chalk from "chalk";

import { db } from "./../server/mongoClient.js";
import { ERROR } from "./../blueprints/chalk.js";
import { tokenSchema } from "./../models/token.js";

export async function getAll(req, res) {
  const token = req.header("Authorization").slice(7);
  const validate = tokenSchema.validate(
    { token: token },
    {
      abortEarly: false,
    }
  );
  if (validate.error) {
    console.log(
      chalk.red(`${ERROR} ${validate.error.details.map((e) => e.message)}`)
    );
    return res.status(422).send({
      message: "invalid input",
      details: validate.error.details.map((e) => e.message),
    });
  }

  try {
    const userHasToken = await db.collection("sessions").findOne({
      token: token,
    });
    if (!userHasToken) {
      console.log(chalk.red(`${ERROR} user is not logged in`));
      return res.status(404).send({
        message: "user is not logged in",
        detail: "Ensure that user is logged in",
      });
    }

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
  } catch (err) {
    console.log(chalk.red(`${ERROR} ${err}`));
    return res.status(500).send({
      message: "Internal error while getting transactions",
      detail: err,
    });
  }

  try {
    const transactions = await db.collection("transactions").find().toArray();
    res.send(transactions);
  } catch (err) {
    console.log(chalk.red(`${ERROR} ${err}`));
    res.status(500).send({
      message: "Internal error while getting transactions",
      detail: err,
    });
  }
}
