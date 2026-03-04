const User = require("../models/User.js");
const createUser = async(req, res) => {
    try{
        res.send("User created");
    }catch(err){
        res.status(500).json({ message: err.message });
    }
};
const getUsers = async (req, res) => {
    try {
        res.send("All users");
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
    createUser,
    getUsers,
};