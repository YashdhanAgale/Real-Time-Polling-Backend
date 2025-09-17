const express = require("express");
const { userAuth } = require("../middlewares/auth");
const {
  createPoll,
  getPoll,
  postVote,
  getAllPolls,
  getMyPolls,
} = require("../controller/pollController");

const pollRouter = express.Router();

pollRouter.post("/create", userAuth, createPoll);
pollRouter.get("/me", userAuth, getMyPolls);
pollRouter.get("/:id", userAuth, getPoll);
pollRouter.post("/:id/vote", userAuth, postVote);
pollRouter.get("/", userAuth, getAllPolls);

module.exports = pollRouter;
