const mongoose = require("mongoose");

const leaveRequestSchema = new mongoose.Schema({

  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  startDate: {
    type: Date,
    required: true
  },

  endDate: {
    type: Date,
    required: true
  },

  totalDays: {
    type: Number,
    required: true
  },

  reason: String,

  status: {
    type: String,
    enum: ["Pending", "Approved", "Rejected", "Cancelled"],
    default: "Pending"
  },

  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  reviewedAt: Date

}, { timestamps: true });

module.exports = mongoose.model("LeaveRequest", leaveRequestSchema);