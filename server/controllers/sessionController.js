const Session = require("../models/Session");
const crypto = require("crypto");

/* Generate unique Jitsi meeting link */
const generateMeetingLink = (swapId) => {
  const random = crypto.randomBytes(4).toString("hex");
  return `https://meet.jit.si/skillswap-${swapId}-${random}`;
};


/* Create session */
exports.createSession = async (req, res) => {
  try {

    const {
      swapId,
      teacher,
      learner,
      topic,
      date,
      time,
      duration
    } = req.body;

    /* Check time conflict */
    const conflict = await Session.findOne({
      $or: [
        { teacher },
        { learner }
      ],
      date,
      time
    });

    if (conflict) {
      return res.status(400).json({
        message: "One of the users already has a session at this time"
      });
    }

    /* Generate meeting link */
    const meetingLink = generateMeetingLink(swapId);

    const session = await Session.create({
      swapId,
      teacher,
      learner,
      topic,
      date,
      time,
      duration,
      meetingLink,
      createdBy: req.user
    });

    res.json({
      success: true,
      data: session
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


/* Get sessions for user */
exports.getSessions = async (req, res) => {

  try {

    const userId = req.params.userId;

    const sessions = await Session.find({
      $or: [
        { teacher: userId },
        { learner: userId }
      ]
    })
    .populate("teacher learner");

    res.json({
      success: true,
      data: sessions
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};

/* Delete session */
exports.deleteSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    if (!session.createdBy || session.createdBy.toString() !== req.user.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this session" });
    }

    await Session.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Session deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};