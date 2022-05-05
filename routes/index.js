import express from "express";
import authRouter from "./authRouter.js";
import transactionRouter from "./transactionRouter.js";
import userRouter from "./userRouter.js";

const router = express.Router();
router.use(authRouter);
router.use(transactionRouter);
router.use(userRouter);
export default router;
