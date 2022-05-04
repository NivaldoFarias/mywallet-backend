import bcrypt from "bcrypt";
import chalk from "chalk";
import { v4 as uuid } from "uuid";

import { stripHtml } from "string-strip-html";
import { userSchema } from "../models/user.js";
import { ERROR, database, DB_INFO } from "../app.js";

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
      res.status(422).send(validate.error.details.map((e) => e.message));
      return;
    }

    const userExists = await database
      .collection("accounts")
      .findOne({ email: email });
    if (userExists) {
      console.log(
        chalk.red(`${ERROR} email ${chalk.bold(email)} is already in use`)
      );
      res.status(409).send(`email ${email} is already in use`);
      return;
    }

    try {
      await database.collection("accounts").insertOne({
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
      res.status(500).send(err);
    }
  } catch (err) {
    console.log(chalk.bold.red(err));
    res.status(500).send(err);
  }
}

export async function login(req, res) {
  const email = stripHtml(req.body.email).result.trim();
  const password = req.body.password;

  try {
    const user = await database.collection("accounts").findOne({ email });
    if (!user) {
      console.log(
        chalk.red(`${ERROR} user ${chalk.bold(email)} does not exist`)
      );
      return res.status(404).send(`user ${email} does not exist`);
    }
    if (!bcrypt.compareSync(password, user.password)) {
      console.log(
        chalk.red(`${ERROR} password for user ${chalk.bold(email)} is invalid`)
      );
      return res.status(401).send(`password for user ${email} is invalid`);
    }

    try {
      const token = uuid();

      await database.collection("accounts").updateOne(
        { email: email },
        {
          $set: {
            status: {
              active: true,
              token: token,
              last_login: new Date(),
            },
          },
        }
      );
      console.log(chalk.blue(`${DB_INFO} user ${chalk.bold(email)} logged in`));
      res.send(token);
    } catch (err) {
      console.log(chalk.red(`${ERROR} ${err}`));
      res.status(500).send(err);
    }
  } catch (err) {
    console.log(chalk.red(`${ERROR} ${err}`));
    res.status(500).send(err);
  }
}
