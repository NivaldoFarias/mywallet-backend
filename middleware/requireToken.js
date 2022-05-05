import chalk from "chalk";

import { ERROR } from "./../models/blueprint/chalk.js";
import { tokenSchema } from "./../models/token.js";

export default async function requireToken(req, res, next) {
  const token = req.header("Authorization").slice(7);

  const validate = tokenSchema.validate(
    { token: token },
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
  next();
}
