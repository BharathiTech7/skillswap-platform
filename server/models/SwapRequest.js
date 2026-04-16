const mongoose = require("mongoose");

const swapRequestSchema = new mongoose.Schema(
{
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  skillOffered: String,
  skillRequested: String,

  status: {
    type: String,
    enum: ["pending", "accepted", "rejected"],
    default: "pending"
  }
},
{ timestamps: true }
);

module.exports = mongoose.model("SwapRequest", swapRequestSchema);