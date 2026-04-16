const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");

const errorHandler = require("./middleware/errorMiddleware");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const swapRoutes = require("./routes/swapRoutes");
const sessionRoutes = require("./routes/sessionRoutes");
const challengeRoutes = require("./routes/challengeRoutes");
const messageRoutes = require("./routes/messageRoutes");
const outcomeRoutes = require("./routes/outcomeRoutes");
const taskRoutes = require("./routes/taskRoutes");

const http = require("http");

const setupSocket = require("./socket/socket");

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/swaps", swapRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/challenges", challengeRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/outcomes", outcomeRoutes);
app.use("/api/tasks", taskRoutes);
app.use(errorHandler);
app.get("/", (req, res) => {
  res.send("SkillSwap API running 🚀");
});

const PORT = process.env.PORT || 5000;

/* HTTP server */
const server = http.createServer(app);

/* initialize socket */
setupSocket(server);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});