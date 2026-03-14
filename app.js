const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();
const port = 7000;

app.use(express.json());

const User = require("./models/User");
const leaveRoutes = require("./routes/leaveRoutes");

app.use("/api/leaves", leaveRoutes);

/*
========================
Register
========================
*/
app.post("/api/register", async (req, res) => {
  try {

    const { username, email, password, role } = req.body;

    // check if user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        msg: "User already exists"
      });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      email,
      password: hashPassword,
      role
    });

    res.status(201).json({
      msg: "User created successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {

    res.status(500).json({
      msg: "Error in registration",
      error: error.message
    });

  }
});

/*
========================
Login
========================
*/
app.post("/api/login", async (req, res) => {

  try {

    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        msg: "Invalid email or password"
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        msg: "Invalid email or password"
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        msg: "Account deactivated"
      });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      "secret_key",
      { expiresIn: "1d" }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role
      }
    });

  } catch (error) {

    res.status(500).json({
      msg: "Login error",
      error: error.message
    });

  }
});

/*
========================
Database Connection
========================
*/
mongoose.connect("mongodb://127.0.0.1:27017/LeaveTrackDB")
  .then(() => {

    console.log("MongoDB Connected");

    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });

  })
  .catch(err => {
    console.log("Database connection error:", err);
  });