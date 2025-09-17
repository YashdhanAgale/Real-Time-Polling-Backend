const { Server } = require("socket.io");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Join poll room
    socket.on("join_poll", (pollId) => {
      socket.join(`poll_${pollId}`);
      console.log(`User ${socket.id} joined poll ${pollId}`);
    });

    socket.on("leave_poll", (pollId) => {
      socket.leave(`poll_${pollId}`);
      console.log(`User ${socket.id} left poll ${pollId}`);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  // Utility to broadcast poll update
  const broadcastPollUpdate = async (pollId) => {
    const poll = await prisma.poll.findUnique({
      where: { id: pollId },
      include: {
        options: {
          include: { votes: true },
        },
      },
    });
    io.to(`poll_${pollId}`).emit("poll_update", poll);
  };

  global.broadcastPollUpdate = broadcastPollUpdate;
};

module.exports = initializeSocket;
