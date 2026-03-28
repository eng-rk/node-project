const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {

  try {

    const { username, email, password, role } = req.body;

    // Validation: First and Last name required
    if (!username || username.trim().split(/\s+/).length < 2) {
      return res.status(400).json({ msg: "Please provide both first and last name" });
    }

    // Validation: Password length and complexity
    // 8-20 characters, at least one special character
    const passwordRegex = /^(?=.*[!@#$%^&*(),.?":{}|<>]).{8,20}$/;
    if (!password || !passwordRegex.test(password)) {
      return res.status(400).json({ 
        msg: "Password must be 8-20 characters long and contain at least one special character" 
      });
    }

    const userExists = await User.findOne({ email });

    if (userExists)
      return res.status(400).json({ msg: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      role: role || "employee"
    });

    res.status(201).json({
      msg: "User registered successfully",
      user
    });

  } catch (err) {

    res.status(500).json({ msg: err.message });

  }
};

const login = async (req, res) => {

  try {

    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user)
      return res.status(400).json({ msg: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch)
      return res.status(400).json({ msg: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token });

  } catch (err) {

    res.status(500).json({ msg: err.message });

  }
};

module.exports = { register, login };