const LeaveRequest = require("../models/LeaveRequest");
const User = require("../models/User");
const Joi = require("joi");

const submitLeaveSchema = Joi.object({
  type: Joi.string().optional(),
  startDate: Joi.date().iso().required(),
  endDate: Joi.date().iso().min(Joi.ref('startDate')).required()
    .messages({ 'date.min': 'End date cannot be before start date' }),
  reason: Joi.string().when('type', {
    is: 'Other',
    then: Joi.string().required(),
    otherwise: Joi.string().allow('', null).optional()
  })
}).unknown(true);

const reviewLeaveSchema = Joi.object({
  requestId: Joi.string().required(),
  status: Joi.string().valid('Approved', 'Rejected').required()
}).unknown(true);

const submitLeave = async (req, res) => {

  try {

    const { error, value } = submitLeaveSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ msg: error.details[0].message });
    }

    const { type, startDate, endDate, reason } = value;
    const employeeId = req.user.id;

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start < new Date().setHours(0,0,0,0))
      return res.status(400).json({ msg: "Cannot request leave in the past" });

    if (end < start)
      return res.status(400).json({ msg: "End date cannot be before start date" });

    let totalDays = 0;
    let currentDate = new Date(start);
    currentDate.setHours(0, 0, 0, 0);
    const endDateObj = new Date(end);
    endDateObj.setHours(0, 0, 0, 0);

    while (currentDate <= endDateObj) {
      const dayOfWeek = currentDate.getDay();
      if (dayOfWeek !== 5 && dayOfWeek !== 6) { // 5=Friday, 6=Saturday
        totalDays++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    if (totalDays === 0) {
      return res.status(400).json({ msg: "Leave request must include at least one working day" });
    }

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
      type: type || "Annual",
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

    const { error, value } = reviewLeaveSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ msg: error.details[0].message });
    }

    const { requestId, status } = value;

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