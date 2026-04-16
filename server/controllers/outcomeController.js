const SessionOutcome = require("../models/SessionOutcome");
const { successResponse, errorResponse } = require("../utils/response");

exports.createOutcome = async (req, res) => {
  try {
    const outcome = await SessionOutcome.create(req.body);
    return successResponse(res, outcome, "Session outcome saved successfully.");
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

exports.getOutcomes = async (req, res) => {
  try {
    const outcomes = await SessionOutcome.find().populate("user", "name avatar").sort({ createdAt: -1 });
    return successResponse(res, outcomes, "Outcomes fetched.");
  } catch (error) {
    return errorResponse(res, error.message);
  }
};
