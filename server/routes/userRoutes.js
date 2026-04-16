const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { getProfile, updateProfile, getAllUsers, getMe } = require("../controllers/userController");

router.get("/me", authMiddleware, getMe);
router.get("/:id", getProfile);
router.put("/:id", authMiddleware, updateProfile);
router.get("/", getAllUsers);
module.exports = router;