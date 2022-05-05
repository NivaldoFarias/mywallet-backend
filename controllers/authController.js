import bcrypt from "bcrypt";
import chalk from "chalk";
import { v4 as uuid } from "uuid";
import { stripHtml } from "string-strip-html";

import { ERROR, DB_INFO } from "./../blueprints/chalk.js";
import { userSchema } from "./../models/user.js";
import { db } from "./../server/mongoClient.js";

export async function signup(req, res) {
  const name = stripHtml(req.body.name).result.trim();
  const email = stripHtml(req.body.email).result.trim();
  const password = bcrypt.hashSync(req.body.password, 10);
  try {
    const validate = userSchema.validate(
      { name: name, email: email, password: password },
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

    const userExists = await db
      .collection("accounts")
      .findOne({ email: email });
    if (userExists) {
      console.log(
        chalk.red(`${ERROR} email ${chalk.bold(email)} is already in use`)
      );
      res.status(409).send({
        message: "email is already in use",
        detail: `Ensure that ${email} is not already in use`,
      });
      return;
    }

    try {
      await db.collection("accounts").insertOne({
        name: name,
        email: email,
        password: password,
        balance: {
          $numberDecimal: "0.0",
        },
        singup_date: new Date(),
        status: {
          active: false,
          token: "",
          last_login: new Date(),
        },
      });
      console.log(chalk.blue(`${DB_INFO} user ${chalk.bold(email)} created`));
      res.sendStatus(201);
    } catch (err) {
      console.log(chalk.red(`${ERROR} ${err}`));
      res.status(500).send({
        message: "Internal error creating user",
        detail: err,
      });
    }
  } catch (err) {
    console.log(chalk.bold.red(err));
    res.status(500).send({
      message: "Internal error creating user",
      detail: err,
    });
  }
}

export async function signin(req, res) {
  const email = stripHtml(req.body.email).result.trim();
  const password = req.body.password;

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
    } else if (!bcrypt.compareSync(password, user.password)) {
      console.log(
        chalk.red(`${ERROR} password for user ${chalk.bold(email)} is invalid`)
      );
      return res.status(403).send({
        message: `password for user ${email} is invalid`,
        detail: `Ensure that the username and password included in the request are correct`,
      });
    }

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

    try {
      const token = uuid();

      await db.collection("sessions").insertOne({
        userId: user._id,
        active: false,
        token: token,
        last_login: null,
      });
      console.log(chalk.blue(`${DB_INFO} user ${chalk.bold(email)} logged in`));
      res.send({
        token: token,
      });
    } catch (err) {
      console.log(chalk.red(`${ERROR} ${err}`));
      res.status(500).send({
        message: "Internal error while logging in user",
        detail: err,
      });
    }
  } catch (err) {
    console.log(chalk.red(`${ERROR} ${err}`));
    res.status(500).send({
      message: "Internal error while logging in user",
      detail: err,
    });
  }
}
