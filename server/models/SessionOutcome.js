const mongoose = require("mongoose");

const sessionOutcomeSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String, 
      required: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    taught: {
      type: String,
      required: true
    },
    learned: {
      type: String,
      required: true
    },
    confidence: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    review: {
      type: String,
      required: true
    },
    nextTopic: {
      type: String,
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("SessionOutcome", sessionOutcomeSchema);
