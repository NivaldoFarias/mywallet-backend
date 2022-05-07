import express from "express";
import authRouter from "./authRouter.js";
import transactionRouter from "./transactionRouter.js";
import transferRouter from "./transferRouter.js";
import userRouter from "./userRouter.js";

const router = express.Router();
router.use(userRouter);
router.use(authRouter);
router.use(transactionRouter);
router.use(transferRouter);
export default router;
