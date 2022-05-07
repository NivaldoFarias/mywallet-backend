import chalk from "chalk";
import { stripHtml } from "string-strip-html";

import { ERROR } from "./../models/blueprint/chalk.js";
import { transactionSchema } from "./../models/transaction.js";

export default async function validateTransaction(req, res, next) {
  const { amount } = req.body;
  const description = stripHtml(req.body.description).result.trim();
  const type = stripHtml(req.body.type).result.trim();

  const validate = transactionSchema.validate(
    { type, description, amount },
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
  res.locals.amount = amount;
  res.locals.description = description;
  res.locals.type = type;
  next();
}
