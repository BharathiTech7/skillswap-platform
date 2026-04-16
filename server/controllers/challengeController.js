const Challenge = require("../models/Challenge");
const ChallengeAttempt = require("../models/ChallengeAttempt");
const User = require("../models/User");
const { successResponse, errorResponse } = require("../utils/response");

/**
 * Get today's daily challenge personalized to user skills.
 * Uses a deterministic seed (date-based) so every user gets one challenge per day,
 * but the challenge is filtered by their skills first.
 */
exports.getDailyChallenge = async (req, res) => {
  try {
    const userId = req.user;
    const user = await User.findById(userId);

    if (!user) {
      return errorResponse(res, "User not found", 404);
    }

    // Combine user skills for matching
    const userSkills = [
      ...(user.skillsOffered || []),
      ...(user.skillsWanted || []),
    ].map((s) => s.toLowerCase());

    // Get today's date string as seed
    const today = new Date();
    const dateKey =
      today.getFullYear() +
      "-" +
      String(today.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(today.getDate()).padStart(2, "0");

    // Try to find challenges matching user's skills first
    let challenges;
    if (userSkills.length > 0) {
      const regexPatterns = userSkills.map(
        (s) => new RegExp(s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i")
      );
      challenges = await Challenge.find({
        skillTag: { $in: regexPatterns },
      });
    }

    // If no skill-matched challenges, fallback to all challenges
    if (!challenges || challenges.length === 0) {
      challenges = await Challenge.find({});
    }

    if (challenges.length === 0) {
      return errorResponse(res, "No challenges available", 404);
    }

    // Deterministic daily pick based on date
    const dateSeed = dateKey.split("-").reduce((a, b) => a + parseInt(b), 0);
    const index = dateSeed % challenges.length;
    const todayChallenge = challenges[index];

    // Check if user already attempted today's challenge
    const existingAttempt = await ChallengeAttempt.findOne({
      userId,
      challengeId: todayChallenge._id,
    });

    return successResponse(
      res,
      {
        challenge: {
          _id: todayChallenge._id,
          title: todayChallenge.title,
          description: todayChallenge.description,
          skillTag: todayChallenge.skillTag,
          difficulty: todayChallenge.difficulty,
          options: todayChallenge.options,
          xpReward: todayChallenge.xpReward,
        },
        alreadyAttempted: !!existingAttempt,
        attempt: existingAttempt
          ? {
              selectedAnswer: existingAttempt.selectedAnswer,
              isCorrect: existingAttempt.isCorrect,
              xpEarned: existingAttempt.xpEarned,
              correctAnswer: todayChallenge.correctAnswer,
            }
          : null,
        dateKey,
      },
      "Daily challenge fetched"
    );
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

/**
 * Submit an answer for today's challenge.
 * Prevents duplicate attempts and awards XP + streak bonuses.
 */
exports.submitAnswer = async (req, res) => {
  try {
    const userId = req.user;
    const { challengeId, selectedAnswer } = req.body;

    if (!challengeId || !selectedAnswer) {
      return errorResponse(res, "challengeId and selectedAnswer are required", 400);
    }

    // Check for existing attempt
    const existingAttempt = await ChallengeAttempt.findOne({
      userId,
      challengeId,
    });

    if (existingAttempt) {
      return errorResponse(res, "You have already attempted this challenge today", 400);
    }

    const challenge = await Challenge.findById(challengeId);
    if (!challenge) {
      return errorResponse(res, "Challenge not found", 404);
    }

    const isCorrect = selectedAnswer === challenge.correctAnswer;
    const user = await User.findById(userId);

    // Calculate streak
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let newStreak = 0;
    if (isCorrect) {
      if (
        user.lastChallengeDate &&
        new Date(user.lastChallengeDate).setHours(0, 0, 0, 0) >=
          yesterday.getTime()
      ) {
        // Continued streak
        newStreak = (user.challengeStreak || 0) + 1;
      } else {
        // New streak
        newStreak = 1;
      }
    } else {
      // Wrong answer breaks streak
      newStreak = 0;
    }

    // XP calculation: base + streak bonus
    let xpEarned = 0;
    if (isCorrect) {
      const difficultyMultiplier =
        challenge.difficulty === "hard"
          ? 1.5
          : challenge.difficulty === "easy"
          ? 0.75
          : 1;
      const streakBonus = Math.min(newStreak * 10, 100); // Max 100 bonus XP from streak
      xpEarned = Math.round(challenge.xpReward * difficultyMultiplier + streakBonus);
    }

    // Save attempt
    const attempt = await ChallengeAttempt.create({
      userId,
      challengeId,
      selectedAnswer,
      isCorrect,
      xpEarned,
    });

    // Update user
    await User.findByIdAndUpdate(userId, {
      $inc: { xp: xpEarned },
      challengeStreak: newStreak,
      lastChallengeDate: new Date(),
    });

    return successResponse(
      res,
      {
        isCorrect,
        correctAnswer: challenge.correctAnswer,
        xpEarned,
        newStreak,
        totalXp: (user.xp || 0) + xpEarned,
      },
      isCorrect ? "Correct! Well done!" : "Incorrect. Better luck next time!"
    );
  } catch (error) {
    if (error.code === 11000) {
      return errorResponse(res, "You have already attempted this challenge", 400);
    }
    return errorResponse(res, error.message);
  }
};

/**
 * Get user's challenge progress: XP, streak, and recent attempts.
 */
exports.getUserProgress = async (req, res) => {
  try {
    const userId = req.user;
    const user = await User.findById(userId).select(
      "name xp challengeStreak lastChallengeDate"
    );

    if (!user) {
      return errorResponse(res, "User not found", 404);
    }

    // Get recent attempts with challenge data
    const recentAttempts = await ChallengeAttempt.find({ userId })
      .sort({ attemptedAt: -1 })
      .limit(10)
      .populate("challengeId", "title skillTag difficulty xpReward");

    // Calculate level (every 500 XP = 1 level)
    const level = Math.floor((user.xp || 0) / 500) + 1;
    const xpInCurrentLevel = (user.xp || 0) % 500;
    const xpToNextLevel = 500;

    // Total stats
    const totalAttempts = await ChallengeAttempt.countDocuments({ userId });
    const correctAttempts = await ChallengeAttempt.countDocuments({
      userId,
      isCorrect: true,
    });

    return successResponse(
      res,
      {
        xp: user.xp || 0,
        level,
        xpInCurrentLevel,
        xpToNextLevel,
        streak: user.challengeStreak || 0,
        lastChallengeDate: user.lastChallengeDate,
        totalAttempts,
        correctAttempts,
        accuracy:
          totalAttempts > 0
            ? Math.round((correctAttempts / totalAttempts) * 100)
            : 0,
        recentAttempts: recentAttempts.map((a) => ({
          title: a.challengeId?.title || "Unknown",
          skillTag: a.challengeId?.skillTag || "General",
          difficulty: a.challengeId?.difficulty || "medium",
          isCorrect: a.isCorrect,
          xpEarned: a.xpEarned,
          attemptedAt: a.attemptedAt,
        })),
      },
      "Progress fetched"
    );
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

/**
 * Get the global leaderboard (top 10 users by XP).
 */
exports.getLeaderboard = async (req, res) => {
  try {
    const topUsers = await User.find({})
      .select("name xp challengeStreak")
      .sort({ xp: -1 })
      .limit(10);

    return successResponse(
      res,
      topUsers.map((u, index) => ({
        rank: index + 1,
        name: u.name,
        xp: u.xp || 0,
        streak: u.challengeStreak || 0,
      })),
      "Leaderboard fetched"
    );
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

