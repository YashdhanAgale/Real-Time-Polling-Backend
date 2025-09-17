const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validateSignupData } = require("../utils/validation");
const prisma = new PrismaClient();

const signUp = async (req, res) => {
  try {
    validateSignupData(req);

    const { firstName, lastName, emailId, password } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { email: emailId },
    });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { firstName, lastName, email: emailId, passwordHash },
    });

    res.json({ message: "User created", user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { emailId, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email: emailId } });
    if (!user) throw new Error("Invalid credentials");

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) throw new Error("Invalid credentials");

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.cookie("token", token, { httpOnly: true });
    res.json({ message: "Login successful", user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const logout = async (req, res) => {
  res
    .cookie("token", null, {
      expires: new Date(Date.now()),
    })
    .send("User Logged out Successfully");
};

const me = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    res.json(req.user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { signUp, login, logout, me };
