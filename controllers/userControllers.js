const User = require("../models/User");
const Joi = require("joi");

const updateProfileSchema = Joi.object({
  username: Joi.string().custom((value, helpers) => {
    if (value.trim().split(/\\s+/).length < 2) {
      return helpers.message("Please provide both first and last name");
    }
    return value;
  }).optional(),
  email: Joi.string().email().optional()
}).unknown(true);

const updateUserSchema = Joi.object({
  role: Joi.string().valid("employee", "manager", "admin").optional(),
  managerId: Joi.string().allow(null, "").optional()
}).unknown(true);

const getUsers = async (req, res) => {

  try {

    const users = await User.find().select("-password");

    res.json(users);

  } catch (err) {

    res.status(500).json({ msg: err.message });

  }
};

const deactivateUser = async (req, res) => {

  try {

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    res.json(user);

  } catch (err) {

    res.status(500).json({ msg: err.message });

  }
};

const updateProfile = async (req, res) => {
  try {
    const { error, value } = updateProfileSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ msg: error.details[0].message });
    }
    const { username, email } = value;
    const user = await User.findById(req.user.id);
    
    if (!user) return res.status(404).json({ msg: "User not found" });

    if (username) user.username = username;
    if (email) user.email = email;

    await user.save();

    res.json({ msg: "Profile updated", user });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const { error, value } = updateUserSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ msg: error.details[0].message });
    }
    const { role, managerId } = value;
    const user = await User.findById(req.params.id);
    
    if (!user) return res.status(404).json({ msg: "User not found" });

    if (role) user.role = role;
    if (managerId !== undefined) {
      user.managerId = managerId || null;
    }

    await user.save();

    res.json({ msg: "User updated", user });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ msg: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

module.exports = { getUsers, deactivateUser, updateProfile, updateUser, getProfile };