import express from "express";
import dotenv from "dotenv";
dotenv.config();

import validateUser from "./../middleware/validateUser.js";
import isUserUnique from "./../middleware/isUserUnique.js";
import userExists from "./../middleware/userExists.js";
import validateSignin from "./../middleware/validateSignin.js";
import isUserOnline from "./../middleware/isUserOnline.js";

import * as auth from "./../controllers/authController.js";

const authRouter = express.Router();
authRouter.post(process.env.SIGNUP, validateUser, isUserUnique, auth.signup);
authRouter.post(
  process.env.SIGNIN,
  userExists,
  validateSignin,
  isUserOnline,
  auth.signin
);
export default authRouter;
