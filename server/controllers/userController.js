const User = require("../models/User");
const { successResponse, errorResponse } = require("../utils/response");

// Get user profile
exports.getProfile = async (req, res) => {
  try {

    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return errorResponse(res, "User not found", 404);
    }

    return successResponse(res, user, "User profile fetched");

  } catch (error) {

    return errorResponse(res, error.message);

  }
};

// Get current user profile
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user).select("-password");
    if (!user) {
      return errorResponse(res, "User not found", 404);
    }
    return successResponse(res, user, "Current user profile fetched");
  } catch (error) {
    return errorResponse(res, error.message);
  }
};


// Update user profile
exports.updateProfile = async (req, res) => {
  try {

    const { bio, skillsOffered, skillsWanted } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return errorResponse(res, "User not found", 404);
    }

    user.bio = bio || user.bio;
    user.skillsOffered = skillsOffered || user.skillsOffered;
    user.skillsWanted = skillsWanted || user.skillsWanted;
    user.isProfileComplete = true;

    const updatedUser = await user.save();

    return successResponse(res, updatedUser, "Profile updated successfully");

  } catch (error) {

    return errorResponse(res, error.message);

  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    return successResponse(res, users, "Users fetched successfully");
  } catch (error) {
    return errorResponse(res, error.message);
  }
};