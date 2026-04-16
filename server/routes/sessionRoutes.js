const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { createSession, getSessions, deleteSession } = require("../controllers/sessionController");

router.post("/create", authMiddleware, createSession);
router.get("/user/:userId", authMiddleware, getSessions);
router.delete("/:id", authMiddleware, deleteSession);

module.exports = router;