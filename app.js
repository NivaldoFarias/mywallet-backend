import express, { json } from "express";
import cors from "cors";
import chalk from "chalk";
import dotenv from "dotenv";

import router from "./routes/index.js";
import { SERVER_INFO } from "./models/blueprint/chalk.js";

dotenv.config();
const app = express().use(json()).use(cors()).use(router);
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    chalk.bold.yellow(
      `${SERVER_INFO} Server started on port ${chalk.bold.yellow(PORT)}`
    )
  );
});
