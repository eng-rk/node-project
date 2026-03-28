const LeaveRequest = require("../models/LeaveRequest");
const User = require("../models/User");

const submitLeave = async (req, res) => {

  try {

    const { startDate, endDate, reason } = req.body;
    const employeeId = req.user.id;

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start < new Date().setHours(0,0,0,0))
      return res.status(400).json({ msg: "Cannot request leave in the past" });

    if (end < start)
      return res.status(400).json({ msg: "End date cannot be before start date" });

    const diffTime = Math.abs(end - start);
    const totalDays = Math.ceil(diffTime / (1000*60*60*24)) + 1;

    const overlap = await LeaveRequest.findOne({
      employeeId,
      status: { $ne: "Rejected" },
      $or: [
        { startDate: { $lte: end }, endDate: { $gte: start } }
      ]
    });

    if (overlap)
      return res.status(400).json({ msg: "Overlapping leave request" });

    const user = await User.findById(employeeId);

    if (user.leaveBalance < totalDays)
      return res.status(400).json({ msg: "Insufficient leave balance" });

    const request = await LeaveRequest.create({
      employeeId,
      startDate,
      endDate,
      totalDays,
      reason
    });

    res.status(201).json({
      msg: "Leave request submitted",
      request
    });

  } catch (err) {

    res.status(500).json({ msg: err.message });

  }
};

const reviewLeave = async (req, res) => {

  try {

    const { requestId, status } = req.body;

    const request = await LeaveRequest.findById(requestId);

    if (!request)
      return res.status(404).json({ msg: "Request not found" });

    const employee = await User.findById(request.employeeId);

    if (req.user.role === "manager") {

      if (!employee.managerId ||
          employee.managerId.toString() !== req.user.id) {
        return res.status(403).json({
          msg: "You can only review your team's requests"
        });
      }

    }

    if (status === "Approved") {

      if (employee.leaveBalance < request.totalDays) {
        return res.status(400).json({ msg: "Insufficient leave balance" });
      }

      employee.leaveBalance -= request.totalDays;
      await employee.save();

    }

    request.status = status;
    request.reviewedBy = req.user.id;
    request.reviewedAt = Date.now();

    await request.save();

    res.json({ msg: `Request ${status}` });

  } catch (err) {

    res.status(500).json({ msg: err.message });

  }
};

const getMyLeaves = async (req, res) => {

  try {

    const leaves = await LeaveRequest
      .find({ employeeId: req.user.id })
      .sort({ createdAt: -1 });

    res.json(leaves);

  } catch (err) {

    res.status(500).json({ msg: err.message });

  }
};

const cancelLeave = async (req, res) => {
  try {
    const request = await LeaveRequest.findOne({
      _id: req.params.id,
      employeeId: req.user.id
    });

    if (!request) return res.status(404).json({ msg: "Request not found" });

    if (request.status !== "Pending") {
      return res.status(400).json({ msg: "Only pending requests can be cancelled" });
    }

    request.status = "Cancelled";
    await request.save();

    res.json({ msg: "Leave cancelled", request });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

const getTeamLeaves = async (req, res) => {
  try {
    let query = {};
    if (req.user.role !== 'admin') {
      const teamMembers = await User.find({ managerId: req.user.id }).select("_id");
      const memberIds = teamMembers.map(member => member._id);
      query = { employeeId: { $in: memberIds } };
    }

    const leaves = await LeaveRequest.find(query)
      .populate("employeeId", "username email leaveBalance")
      .sort({ createdAt: -1 });

    res.json(leaves);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

module.exports = {
  submitLeave,
  reviewLeave,
  getMyLeaves,
  cancelLeave,
  getTeamLeaves
};