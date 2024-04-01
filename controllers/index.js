import bcrypt from "bcrypt";
import { User, Todo } from "../model/index.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const testApi = (req, res) => {
  res.send("testing api");
};

export const registerUser = async (req, res) => {
  const { username, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const newUser = new User({ username, password: hashedPassword, email });
    await newUser.save();
    res.status(201).send("User created successfully");
  } catch (err) {
    res.status(400).send(err.message);
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    const token = await jwt.sign(
      { id: user._id, email: user.email },
      process.env.SECRET_KEY
    );

    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      res.cookie("token", token, { httpOnly: true });
      return res
        .status(200)
        .json({ message: "Login successful", userInfo: user, token: token });
    } else {
      return res.status(401).json({ message: "Invalid username or password" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateUser = async (req, res) => {
  const updatedInfo = req.body;
  const userId = req.user.id;

  try {
    if (updatedInfo.password) {
      updatedInfo.password = await bcrypt.hash(updatedInfo.password, 10);
    }
    const user = await User.findOneAndUpdate(
      { _id: userId },
      { $set: updatedInfo },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({ message: "User updated successfully", user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const deleteUser = async (req, res) => {
  const userId = req.user.id;
  try {
    const del = await User.findOneAndDelete({ _id: userId });
    if (del) {
      return res.status(200).send({ message: "User deleted successfully" });
    } else {
      return res.status(404).send({ message: "User not found" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: "Internal Server Error" });
  }
};

export const createTodos = async (req, res) => {
  const userId = req.user.id;
  const { title, description } = req.body;

  try {
    const todo = new Todo({
      title,
      description,
      completed: false,
    });

    await todo.save();

    const user = await User.findByIdAndUpdate(
      userId,
      { $push: { todos: todo._id } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ message: "Todo created successfully", todo });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getTodos = async (req, res) => {
  const userId = req.user.id;

  try {
    const user = await User.findOne({ _id: userId }).populate("todos");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ todos: user.todos });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateTodos = async (req, res) => {
  const userId = req.user.id;
  const { title, description, completed } = req.body;
  const todoId = req.params.todoId;

  try {
    const user = await User.findOne({ _id: userId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.todos.includes(todoId)) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const updatedTodo = await Todo.findByIdAndUpdate(
      todoId,
      { title, description, completed },
      { new: true }
    );

    if (!updatedTodo) {
      return res.status(404).json({ message: "Todo not found" });
    }

    return res
      .status(200)
      .json({ message: "Todo updated successfully", todo: updatedTodo });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const deleteTodos = async (req, res) => {
  const userId = req.user.id;
  const todoId = req.params.todoId;

  try {
    const user = await User.findOne({ _id: userId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.todos.includes(todoId)) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const deletedTodo = await Todo.findOneAndDelete({ _id: todoId });

    if (!deletedTodo) {
      return res.status(404).json({ message: "Todo not found" });
    }

    return res
      .status(200)
      .json({ message: "Todo deleted successfully", todo: deletedTodo });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
