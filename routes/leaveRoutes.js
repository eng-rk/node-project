const express = require("express");
const router = express.Router();

const {
  submitLeave,
  reviewLeave,
  getMyLeaves,
  cancelLeave,
  getTeamLeaves
} = require("../controllers/leaveControllers");

const { verifyToken, checkRole } = require("../middleware/auth");

router.post("/submit", verifyToken, submitLeave);

router.get("/my-leaves", verifyToken, getMyLeaves);

router.post(
  "/review",
  verifyToken,
  checkRole(["manager", "admin"]),
  reviewLeave
);

router.patch("/:id/cancel", verifyToken, cancelLeave);

router.get("/team", verifyToken, checkRole(["manager", "admin"]), getTeamLeaves);

module.exports = router;