const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");

const {
  getDailyChallenge,
  submitAnswer,
  getUserProgress,
  getLeaderboard,
} = require("../controllers/challengeController");

router.get("/daily", auth, getDailyChallenge);
router.post("/submit", auth, submitAnswer);
router.get("/progress", auth, getUserProgress);
router.get("/leaderboard", auth, getLeaderboard);

module.exports = router;
