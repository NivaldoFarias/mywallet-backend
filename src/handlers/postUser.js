import { stripHtml } from "string-strip-html";
import { userSchema } from "./../models/user.js";
import { ERROR, database, DB_INFO } from "../app.js";
import bcrypt from "bcrypt";
import chalk from "chalk";

export async function postUser(req, res) {
  const name = stripHtml(req.header("user")).result.trim();
  const email = stripHtml(req.body.email).result.trim();
  const password = bcrypt.hashSync(req.body.password, 10);
  try {
    const validate = userSchema.validate(
      { name: name, email: email, password: password },
      {
        abortEarly: true,
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
      .collection("users")
      .findOne({ email: email });
    if (userExists) {
      console.log(
        chalk.red(`${ERROR} email ${chalk.bold(email)} is already in use`)
      );
      res.status(409).send(`email ${email} is already in use`);
      return;
    }

    try {
      await database.collection("users").insertOne({
        name: name,
        email: email,
        password: password,
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
