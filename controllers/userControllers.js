const User = require("../models/User");

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
    const { username, email } = req.body;
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
    const { role, managerId } = req.body;
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

module.exports = { getUsers, deactivateUser, updateProfile, updateUser };