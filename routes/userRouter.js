import express from "express";
import dotenv from "dotenv";
import * as user from "./../controllers/userController.js";
dotenv.config();

const userRouter = express.Router();
userRouter.get(process.env.GET_USERS, user.getAll);
export default userRouter;
