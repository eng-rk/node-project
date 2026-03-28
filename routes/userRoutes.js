const express = require("express");
const router = express.Router();

const { getUsers, deactivateUser, updateUser, updateProfile, getProfile } = require("../controllers/userControllers");

const { verifyToken, checkRole } = require("../middleware/auth");

router.get("/", verifyToken, checkRole(["admin"]), getUsers);
router.get("/profile", verifyToken, getProfile);

router.patch(
  "/:id/deactivate",
  verifyToken,
  checkRole(["admin"]),
  deactivateUser
);

router.patch("/profile", verifyToken, updateProfile);

router.patch(
  "/:id",
  verifyToken,
  checkRole(["admin"]),
  updateUser
);

module.exports = router;