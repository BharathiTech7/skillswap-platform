const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
{
    name: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true,
        unique: true
    },

    password: {
        type: String,
        required: true
    },

    bio: {
        type: String,
        default: ""
    },

    skillsOffered: {
        type: [String],
        default: []
    },

    skillsWanted: {
        type: [String],
        default: []
    },

    rating: {
        type: Number,
        default: 0
    },

    xp: {
        type: Number,
        default: 0
    },

    challengeStreak: {
        type: Number,
        default: 0
    },

    lastChallengeDate: {
        type: Date,
        default: null
    },
    
    isProfileComplete: {
        type: Boolean,
        default: false
    }

},
{ timestamps: true }
);

module.exports = mongoose.model("User", userSchema);