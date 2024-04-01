import express from "express";
import { verifyToken } from "../index.js";
import {
  testApi,
  registerUser,
  loginUser,
  updateUser,
  deleteUser,
  createTodos,
  getTodos,
  updateTodos,
  deleteTodos,
} from "../controllers/index.js";

const router = express.Router();

router.route("/test").get(testApi);

router.route("/register").post(registerUser);

router.route("/login").post(loginUser);

router
  .route("/update")
  .patch(verifyToken, updateUser)
  .delete(verifyToken, deleteUser);

router
  .route("/todos")
  .post(verifyToken, createTodos)
  .get(verifyToken, getTodos);

router
  .route("/todos/:todoId")
  .patch(verifyToken, updateTodos)
  .delete(verifyToken, deleteTodos);

export default router;
