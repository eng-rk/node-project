const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');
const LeaveRequest = require('./models/LeaveRequest');

async function diagnose() {
    try {
        await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/LeaveTrackDB");
        console.log("Connected to DB");

        const users = await User.find();
        console.log("\n--- Users ---");
        users.forEach(u => {
            console.log(`User: ${u.username}, ID: ${u._id}, Role: ${u.role}, ManagerId: ${u.managerId}`);
        });

        const leaves = await LeaveRequest.find();
        console.log("\n--- Leave Requests ---");
        leaves.forEach(l => {
            console.log(`Leave: ${l._id}, EmployeeId: ${l.employeeId}, Status: ${l.status}`);
        });

        await mongoose.connection.close();
    } catch (err) {
        console.error(err);
    }
}

diagnose();
