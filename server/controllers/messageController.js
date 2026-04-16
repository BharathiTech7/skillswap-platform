const Message = require("../models/Message");
const { successResponse, errorResponse } = require("../utils/response");

// send message
exports.sendMessage = async (req, res) => {

  try {

    const message = await Message.create(req.body);

    return successResponse(res, message, "Message sent successfully");

  } catch (error) {

    return errorResponse(res, error.message);

  }

};

// get chat history
exports.getMessages = async (req, res) => {

  try {

    const messages = await Message.find({
      $or: [
        { sender: req.params.user1, receiver: req.params.user2 },
        { sender: req.params.user2, receiver: req.params.user1 }
      ]
    });

    return successResponse(res, messages, "Messages fetched successfully");

  } catch (error) {

    return errorResponse(res, error.message);

  }

};