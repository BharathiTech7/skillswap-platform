const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { sendRequest, updateRequest, getRequests, deleteRequest } = require("../controllers/swapController");

router.post("/send", authMiddleware, sendRequest);
router.put("/:id", authMiddleware, updateRequest);
router.delete("/:id", authMiddleware, deleteRequest);
router.get("/user/:userId", authMiddleware, getRequests);
module.exports = router;