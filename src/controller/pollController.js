const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = new PrismaClient();

const createPoll = async (req, res) => {
  try {
    const { question, options } = req.body;

    if (!question || question.trim().length === 0) {
      return res.status(400).json({ error: "Poll question is required" });
    }

    if (!options || !Array.isArray(options)) {
      return res.status(400).json({ error: "Options must be an array" });
    }

    const filteredOptions = options
      .map((opt) => opt.trim())
      .filter((opt) => opt.length > 0);

    if (filteredOptions.length < 4 || filteredOptions.length > 5) {
      return res
        .status(400)
        .json({ error: "Poll must have between 4 and 5 options" });
    }

    const poll = await prisma.poll.create({
      data: {
        question: question.trim(),
        creatorId: req.user.id,
        isPublished: true,
        options: {
          create: filteredOptions.map((opt) => ({ text: opt })),
        },
      },
      include: { options: true },
    });

    res.status(201).json(poll);
  } catch (err) {
    console.error("Create poll error:", err);
    res.status(500).json({ error: "Something went wrong creating poll" });
  }
};

const getPoll = async (req, res) => {
  try {
    const poll = await prisma.poll.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        options: {
          include: { votes: true },
        },
      },
    });
    res.json(poll);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const postVote = async (req, res) => {
  try {
    const { optionId } = req.body;
    const pollId = Number(req.params.id);

    const option = await prisma.pollOption.findUnique({
      where: { id: optionId },
    });

    if (!option || option.pollId !== pollId) {
      return res.status(400).json({ error: "Invalid option" });
    }

    let vote;
    try {
      vote = await prisma.vote.create({
        data: {
          userId: req.user.id,
          pollOptionId: optionId,
          pollId: pollId,
        },
      });
    } catch (err) {
      console.error("Vote error:", err);
      if (err.code === "P2002") {
        return res
          .status(400)
          .json({ error: "You already voted in this poll" });
      }
      return res.status(500).json({ error: "Unexpected error while voting" });
    }

    if (global.broadcastPollUpdate) {
      await global.broadcastPollUpdate(pollId);
    }

    res.json(vote);
  } catch (err) {
    console.error("PostVote failed:", err);
    res.status(500).json({ error: err.message });
  }
};

const getAllPolls = async (req, res) => {
  try {
    const polls = await prisma.poll.findMany({
      include: {
        options: {
          include: { votes: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(polls);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getMyPolls = async (req, res) => {
  try {
    console.log("Inside getMyPolls. req.user:", req.user);

    const polls = await prisma.poll.findMany({
      where: { creatorId: req.user.id },
      include: {
        options: {
          include: { votes: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(polls);
  } catch (err) {
    console.error("getMyPolls error:", err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = { createPoll, getPoll, postVote, getAllPolls, getMyPolls };
