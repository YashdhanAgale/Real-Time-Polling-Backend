const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const authRouter = require("./routes/auth");
const pollRouter = require("./routes/poll");
require("dotenv").config();

const http = require("http");
const initializeSocket = require("./utils/socket"); 

const app = express();
const PORT = process.env.PORT;

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use("/auth", authRouter);
app.use("/poll", pollRouter);

const server = http.createServer(app);

// Initialize socket
initializeSocket(server);

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
