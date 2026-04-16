const { Server } = require("socket.io");

const setupSocket = (server) => {
  const io = new Server(server, {
    cors: { origin: "*" }
  });

  let onlineUsers = [];

  io.on("connection", (socket) => {
    socket.on("addUser", (userId) => {
      onlineUsers = onlineUsers.filter((user) => user.userId !== userId);
      onlineUsers.push({ userId, socketId: socket.id });
      io.emit("getOnlineUsers", onlineUsers);
    });

    socket.on("sendMessage", (data) => {
      io.emit("receiveMessage", data);
    });

    socket.on("typing", (data) => {
      io.emit("typing", data);
    });

    socket.on("stopTyping", (data) => {
      io.emit("stopTyping", data);
    });

    socket.on("disconnect", () => {
      onlineUsers = onlineUsers.filter((user) => user.socketId !== socket.id);
      io.emit("getOnlineUsers", onlineUsers);
    });
  });
};

module.exports = setupSocket;