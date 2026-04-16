const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { createOutcome, getOutcomes } = require("../controllers/outcomeController");

router.post("/", authMiddleware, createOutcome);
router.get("/", authMiddleware, getOutcomes);

module.exports = router;
