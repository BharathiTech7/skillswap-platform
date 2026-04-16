const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema(
{
  swapId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SwapRequest",
    required: true
  },

  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  learner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  topic: {
    type: String,
    required: true
  },

  date: {
    type: String,
    required: true
  },

  time: {
    type: String,
    required: true
  },

  duration: {
    type: Number,
    default: 60
  },

  meetingLink: {
    type: String,
    required: true
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }

},
{ timestamps: true }
);

module.exports = mongoose.model("Session", sessionSchema);