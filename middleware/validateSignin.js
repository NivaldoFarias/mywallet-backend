import bcrypt from "bcrypt";
import chalk from "chalk";

import { stripHtml } from "string-strip-html";
import { ERROR } from "../models/blueprint/chalk.js";
import { db } from "./../server/mongoClient.js";

export default async function validateSignin(req, res, next) {
  const email = stripHtml(req.body.email).result.trim();
  const password = req.body.password;

  try {
    const user = await db.collection("accounts").findOne({ email });
    if (!bcrypt.compareSync(password, user.password)) {
      console.log(
        chalk.red(`${ERROR} password for user ${chalk.bold(email)} is invalid`)
      );
      return res.status(403).send({
        message: `password for user ${email} is invalid`,
        detail: `Ensure that the username and password included in the request are correct`,
      });
    }
  } catch (err) {
    console.log(chalk.red(`${ERROR} ${err}`));
    res.status(500).send({
      message: "Internal error while logging in user",
      detail: err,
    });
  }
  next();
}
