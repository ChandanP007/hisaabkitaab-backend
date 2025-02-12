import express from "express";
import { Router } from "express";
import authenticate from "../middlewares/middleware.auth.js";
import checkRole from "../middlewares/middleware.role.js";
import {
  createTransaction,
  deleteTransaction,
} from "../controllers/controller.transaction.js";

const router = Router();

router.post(
  "/",
  authenticate,
  checkRole(["business", "admin"]),
  createTransaction
);
router.delete(
  "/:id",
  authenticate,
  checkRole(["business", "admin"]),
  deleteTransaction
);

export default router;
