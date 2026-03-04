const mongoose = require("mongoose");

const leaveRequestSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // [cite: 56]
  startDate: { type: Date, required: true }, // [cite: 57]
  endDate: { type: Date, required: true }, // [cite: 58]
  totalDays: { type: Number, required: true }, // [cite: 59]
  reason: String, // [cite: 60]
  status: { 
    type: String, 
    enum: ['Pending', 'Approved', 'Rejected', 'Cancelled'], 
    default: 'Pending' 
  }, // [cite: 61]
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // [cite: 62]
  reviewedAt: { type: Date } // [cite: 63]
}, { timestamps: true });

module.exports = mongoose.model("LeaveRequest", leaveRequestSchema);