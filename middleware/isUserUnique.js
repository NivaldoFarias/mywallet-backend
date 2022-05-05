import chalk from "chalk";

import { stripHtml } from "string-strip-html";
import { ERROR } from "../models/blueprint/chalk.js";
import { db } from "./../server/mongoClient.js";

export default async function isUserUnique(req, res, next) {
  const email = stripHtml(req.body.email).result.trim();

  try {
    const user = await db.collection("accounts").findOne({ email: email });
    if (user) {
      console.log(
        chalk.red(`${ERROR} email ${chalk.bold(email)} is already in use`)
      );
      return res.status(409).send({
        message: "email is already in use",
        detail: `Ensure that ${email} is not already in use`,
      });
    }
  } catch (err) {
    console.log(chalk.bold.red(err));
    res.status(500).send({
      message: "Internal error creating user",
      detail: err,
    });
  }
  next();
}
