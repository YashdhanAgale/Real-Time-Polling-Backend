const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const userAuth = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    if (!token) return res.status(401).json({ message: "Please Login" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded JWT:", decoded);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });
    console.log("Fetched user from DB:", user);

    if (!user) throw new Error("User not found");

    req.user = user;
    next();
  } catch (err) {
    console.error("Auth error:", err);
    res.status(401).json({ error: "Unauthorized: " + err.message });
  }
};

module.exports = { userAuth };
