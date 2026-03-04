const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['employee', 'manager', 'admin'], default: 'employee' }, // [cite: 51]
  leaveBalance: { type: Number, default: 21 }, // [cite: 52]
  managerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // [cite: 53]
  isActive: { type: Boolean, default: true } // [cite: 25] لتعطيل الحساب
});

module.exports = mongoose.model("User", userSchema);