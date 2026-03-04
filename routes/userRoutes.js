const express = require("express");
const router = express.Router();
const { createUser, getUsers } = require("../controllers/userControllers");

router.get("/users", getUsers);
router.post("/users", createUser);

module.exports = router;