const express = require("express");
const { userAuth } = require("../middlewares/auth");
const { signUp, login, logout, me } = require("../controller/authController");

const authRouter = express.Router();

authRouter.post("/signup", signUp);
authRouter.post("/login", login);
authRouter.post("/logout", logout);
authRouter.get("/me", userAuth, me);

module.exports = authRouter;
