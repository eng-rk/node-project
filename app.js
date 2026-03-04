const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const port = 7000;

app.use(express.json());

const User = require("./models/User");
const leaveRoutes = require("./routes/leaveRoutes");

app.use('/api/leaves', leaveRoutes);

// Register [cite: 10]
app.post("/api/register", async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    const hashPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, password: hashPassword, role });
    res.status(201).json({ msg: "User created", data: user });
  } catch (error) {
    res.status(500).json({ msg: "Error in registration" });
  }
});

// Login [cite: 10, 17]
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user && await bcrypt.compare(password, user.password)) {
      if (!user.isActive) return res.status(403).json({ msg: "Account deactivated" }); // [cite: 25]
      const token = jwt.sign({ id: user._id, role: user.role }, "secret_key", { expiresIn: "1d" });
      return res.json({ success: true, token });
    }
    res.status(400).json({ msg: "Invalid credentials" });
  } catch (error) {
    res.status(500).json({ msg: "Login error" });
  }
});

mongoose.connect("mongodb://127.0.0.1:27017/LeaveTrackDB")
  .then(() => app.listen(port, () => console.log(`Server running on ${port}`)))
  .catch(err => console.log(err));