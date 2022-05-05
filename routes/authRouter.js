import express from "express";
import dotenv from "dotenv";
import * as auth from "./../controllers/authController.js";
dotenv.config();

const authRouter = express.Router();
authRouter.post(process.env.SIGNUP, auth.signup);
authRouter.post(process.env.SIGNIN, auth.signin);
export default authRouter;
