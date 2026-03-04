const LeaveRequest = require("../models/LeaveRequest");
const User = require("../models/User");

// 1. تقديم طلب إجازة [cite: 11]
const submitLeave = async (req, res) => {
  try {
    const { startDate, endDate, reason } = req.body;
    const employeeId = req.user.id;

    const start = new Date(startDate);
    const end = new Date(endDate);

    // التحقق من التواريخ [cite: 38, 39]
    if (start < new Date().setHours(0,0,0,0)) return res.status(400).json({ msg: "Cannot request leave in the past" });
    if (end < start) return res.status(400).json({ msg: "End date cannot be before start date" });

    // حساب الأيام ومنع التداخل [cite: 31, 40]
    const diffTime = Math.abs(end - start);
    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const overlap = await LeaveRequest.findOne({
      employeeId,
      status: { $ne: 'Rejected' },
      $or: [{ startDate: { $lte: end }, endDate: { $gte: start } }]
    });
    if (overlap) return res.status(400).json({ msg: "Overlapping leave requests!" });

    // التحقق من الرصيد [cite: 35]
    const user = await User.findById(employeeId);
    if (user.leaveBalance < totalDays) return res.status(400).json({ msg: "Insufficient balance!" });

    const request = await LeaveRequest.create({ employeeId, startDate, endDate, totalDays, reason });
    res.status(201).json({ msg: "Request submitted", data: request });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// 2. مراجعة الطلب (للمديرين) [cite: 19]
const reviewLeave = async (req, res) => {
  try {
    const { requestId, status } = req.body;
    const request = await LeaveRequest.findById(requestId);
    if (!request) return res.status(404).json({ msg: "Request not found" });

    if (status === 'Approved') {
      const employee = await User.findById(request.employeeId);
      employee.leaveBalance -= request.totalDays; // خصم تلقائي [cite: 36]
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

// 3. عرض تاريخ الإجازات للموظف [cite: 13]
const getMyLeaves = async (req, res) => {
  try {
    const leaves = await LeaveRequest.find({ employeeId: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, data: leaves });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

module.exports = { submitLeave, reviewLeave, getMyLeaves };