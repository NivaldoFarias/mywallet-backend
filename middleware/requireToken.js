import chalk from "chalk";

import { db } from "./../server/mongoClient.js";
import { ERROR } from "./../models/blueprint/chalk.js";

export default async function requireToken(req, res, next) {
  const token = req.header("Authorization")?.slice(7);

  try {
    const tokenUser = await db.collection("sessions").findOne({
      token: token,
    });
    if (!tokenUser) {
      console.log(chalk.red(`${ERROR} Invalid token`));
      return res.status(404).send({
        message: "Invalid token",
        detail: "Ensure that you have a valid token",
      });
    }
    res.locals.token = token;
    res.locals.user = tokenUser;
  } catch (err) {
    console.log(chalk.red(`${ERROR} ${err}`));
    return res.status(500).send({
      message: "Internal error while getting transactions",
      detail: err,
    });
  }
  next();
}
