const TaskChallenge = require("../models/TaskChallenge");
const SwapRequest = require("../models/SwapRequest");
const { successResponse, errorResponse } = require("../utils/response");

exports.createTask = async (req, res) => {
  try {
    const taskData = { ...req.body, author: req.user };
    const task = await TaskChallenge.create(taskData);
    
    // We need to populate the author so the UI renders the avatar and name correctly right away
    await task.populate("author", "name avatar");
    
    return successResponse(res, task, "Task created successfully.");
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

exports.getTasks = async (req, res) => {
  try {
    const tasks = await TaskChallenge.find({ 
      $or: [
        { status: "open" },
        { author: req.user, status: "accepted" }
      ]
    })
    .populate("author", "name avatar")
    .populate("acceptedBy", "name avatar")
    .sort({ createdAt: -1 });
    return successResponse(res, tasks, "Tasks fetched.");
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

exports.acceptTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    const task = await TaskChallenge.findById(id);
    if (!task) return errorResponse(res, "Task not found");

    if (task.author.toString() === userId) {
      return errorResponse(res, "Cannot accept your own task");
    }

    task.acceptedBy = userId;
    task.status = "accepted";
    await task.save();

    // Create a SwapRequest to connect the two users automatically
    await SwapRequest.create({
      sender: userId,
      receiver: task.author,
      skillOffered: task.skillTag,
      skillRequested: `Help with: ${task.title}`,
      status: "accepted" // Automatically accepted so they can chat and schedule
    });

    return successResponse(res, task, "Task accepted. You can now schedule a session or chat with the author.");
  } catch (error) {
    return errorResponse(res, error.message);
  }
};
