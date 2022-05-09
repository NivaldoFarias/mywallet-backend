import express, { json } from "express";
import cors from "cors";
import chalk from "chalk";
import dotenv from "dotenv";

import router from "./routes/index.js";
import { SERVER_INFO } from "./models/blueprint/chalk.js";

dotenv.config();
const PORT = process.env.PORT || 5000;
const app = express();
app.use(cors());
app.use(json());
app.use(router);

app.get("/", (_req, res) => {
  res.send("Online");
});

app.listen(PORT, () => {
  console.log(
    chalk.bold.yellow(
      `${SERVER_INFO} Server started on port ${chalk.bold.yellow(PORT)}`
    )
  );
});
