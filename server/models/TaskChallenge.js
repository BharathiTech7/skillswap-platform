const mongoose = require("mongoose");

const taskChallengeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    skillTag: {
      type: String,
      required: true
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    acceptedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    status: {
      type: String,
      enum: ["open", "accepted", "completed"],
      default: "open"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("TaskChallenge", taskChallengeSchema);
