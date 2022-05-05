import chalk from "chalk";

import { stripHtml } from "string-strip-html";
import { ERROR } from "../models/blueprint/chalk.js";
import { db } from "./../server/mongoClient.js";

export default async function isUserOnline(req, res, next) {
  const email = stripHtml(req.body.email).result.trim();

  try {
    const isUserOnline = await db.collection("sessions").findOne({
      email: email,
    });
    if (isUserOnline.active) {
      console.log(
        chalk.red(`${ERROR} user ${chalk.bold(email)} is already logged in`)
      );
      return res.status(409).send({
        message: `user is already logged in`,
        detail: `Ensure that ${email} is not already logged in`,
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
