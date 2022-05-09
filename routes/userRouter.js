import express from "express";
import dotenv from "dotenv";

import requireToken from "./../middleware/requireToken.js";
import * as user from "./../controllers/userController.js";
dotenv.config();

const userRouter = express.Router();
userRouter.get(process.env.GET_USERS, requireToken, user.getAll);
userRouter.get(process.env.GET_BALANCE, requireToken, user.getBalance);
export default userRouter;
