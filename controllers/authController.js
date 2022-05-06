import bcrypt from "bcrypt";
import chalk from "chalk";
import { v4 as uuid } from "uuid";
import { stripHtml } from "string-strip-html";

import { ERROR, DB_INFO } from "../models/blueprint/chalk.js";
import { db } from "./../server/mongoClient.js";

export async function signup(req, res) {
  const name = stripHtml(req.body.name).result.trim();
  const email = stripHtml(req.body.email).result.trim();
  const password = bcrypt.hashSync(req.body.password, 10);

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
}

export async function signin(req, res) {
  const email = res.locals.email;
  const user = res.locals.user;

  try {
    const token = uuid();
    await db.collection("sessions").insertOne({
      email: user.email,
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
}
