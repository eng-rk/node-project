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

module.exports = { getUsers, deactivateUser };