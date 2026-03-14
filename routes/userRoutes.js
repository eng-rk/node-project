const express = require("express");
const router = express.Router();

const { getUsers, deactivateUser } = require("../controllers/userController");

const { verifyToken, checkRole } = require("../middleware/auth");

router.get("/", verifyToken, checkRole(["admin"]), getUsers);

router.patch(
  "/:id/deactivate",
  verifyToken,
  checkRole(["admin"]),
  deactivateUser
);

module.exports = router;