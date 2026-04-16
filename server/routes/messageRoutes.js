const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { sendMessage, getMessages } = require("../controllers/messageController");

router.post("/send",authMiddleware, sendMessage);
router.get("/:user1/:user2", getMessages);

module.exports = router;