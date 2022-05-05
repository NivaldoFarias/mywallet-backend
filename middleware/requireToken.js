import chalk from "chalk";

import { db } from "./../server/mongoClient.js";
import { ERROR } from "./../models/blueprint/chalk.js";

export default async function requireToken(req, res, next) {
  const token = req.header("Authorization").slice(7);

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
  } catch (err) {
    console.log(chalk.red(`${ERROR} ${err}`));
    return res.status(500).send({
      message: "Internal error while getting transactions",
      detail: err,
    });
  }
  next();
}
