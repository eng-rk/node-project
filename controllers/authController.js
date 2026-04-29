const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Joi = require("joi");

const registerSchema = Joi.object({
  username: Joi.string().custom((value, helpers) => {
    if (value.trim().split(/\s+/).length < 2) {
      return helpers.message("Please provide both first and last name");
    }
    return value;
  }).required(),
  email: Joi.string().email().required(),
  password: Joi.string().pattern(/^(?=.*[!@#$%^&*(),.?":{}|<>]).{8,20}$/).required()
    .messages({
      "string.pattern.base": "Password must be 8-20 characters long and contain at least one special character"
    }),
  role: Joi.string().valid("employee", "manager", "admin").optional()
}).unknown(true);

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
}).unknown(true);

const register = async (req, res) => {

  try {

    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ msg: error.details[0].message });
    }

    const { username, email, password, role } = value;

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

    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ msg: error.details[0].message });
    }

    const { email, password } = value;

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

    const userResponse = {
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      leaveBalance: user.leaveBalance
    };

    res.json({ token, user: userResponse });

  } catch (err) {

    res.status(500).json({ msg: err.message });

  }
};

module.exports = { register, login };