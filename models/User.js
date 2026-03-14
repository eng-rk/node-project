const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['employee', 'manager', 'admin'], default: 'employee' }, 
  leaveBalance: { type: Number, default: 21 }, 
  managerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, 
  isActive: { type: Boolean, default: true } 
});

module.exports = mongoose.model("User", userSchema);