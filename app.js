const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = 7000;

app.use(express.json());
app.use(cors());

// Serve frontend static files
app.use(express.static('public'));
const leaveRoutes = require("./routes/leaveRoutes");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");

app.use('/api/leaves', leaveRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

mongoose.connect("mongodb://127.0.0.1:27017/LeaveTrackDB")
  .then(() => app.listen(port, () => console.log(`Server running at: http://localhost:${port}`)))
  .catch(err => console.log(err));