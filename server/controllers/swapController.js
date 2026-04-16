const SwapRequest = require("../models/SwapRequest");
const { successResponse, errorResponse } = require("../utils/response");

// send request
exports.sendRequest = async (req, res) => {

  try {

    const { sender, receiver, skillOffered, skillRequested } = req.body;

    // check for existing request

    const existingRequest = await SwapRequest.findOne({
      $or: [
        { sender, receiver },
        { sender: receiver, receiver: sender }
      ],
      status: { $in: ["pending", "accepted"] }
    });

    if (existingRequest) {

      return res.status(400).json({
        success: false,
        message: "Swap request already exists between these users"
      });

    }

    const request = await SwapRequest.create({
      sender,
      receiver,
      skillOffered,
      skillRequested
    });

    res.json({
      success: true,
      data: request
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};

// update request status
exports.updateRequest = async (req, res) => {

  try {

    const request = await SwapRequest.findById(req.params.id);

    request.status = req.body.status;

    await request.save();

    return successResponse(res, request, "Swap request updated");

  } catch (error) {
    return errorResponse(res, error.message);
  }

};

exports.getRequests = async (req, res) => {
  try {

    const userId = req.params.userId;

    const requests = await SwapRequest.find({
      $or: [
        { sender: userId },
        { receiver: userId }
      ]
    }).populate("sender receiver");

    res.json({
      success: true,
      data: requests
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }
};

exports.deleteRequest = async (req, res) => {
  try {
    const request = await SwapRequest.findByIdAndDelete(req.params.id);
    if (!request) return errorResponse(res, "Request not found");
    return successResponse(res, null, "Swap request deleted");
  } catch (error) {
    return errorResponse(res, error.message);
  }
};