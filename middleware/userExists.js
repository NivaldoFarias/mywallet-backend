import chalk from "chalk";

import { stripHtml } from "string-strip-html";
import { ERROR } from "../models/blueprint/chalk.js";
import { db } from "./../server/mongoClient.js";

export default async function userExists(req, res, next) {
  const email = stripHtml(req.body.email).result.trim();

  try {
    const user = await db.collection("accounts").findOne({ email });
    if (!user) {
      console.log(
        chalk.red(`${ERROR} user ${chalk.bold(email)} does not exist`)
      );
      return res.status(404).send({
        message: `user does not exist`,
        detail: `Ensure that ${email} is registered`,
      });
    }
  } catch (err) {
    console.log(chalk.bold.red(err));
    res.status(500).send({
      message: "Internal error whilte listing user",
      detail: err,
    });
  }
  next();
}
