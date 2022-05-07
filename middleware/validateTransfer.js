import chalk from "chalk";
import { stripHtml } from "string-strip-html";

import { ERROR } from "./../models/blueprint/chalk.js";
import { transferSchema } from "./../models/transfer.js";

export default async function validateTransfer(req, res, next) {
  const to = stripHtml(req.body.to).result.trim();
  const description = stripHtml(req.body.description).result.trim();
  const { amount } = req.body;

  const validate = transferSchema.validate(
    { to, description, amount },
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
  res.locals.to = to;
  next();
}
