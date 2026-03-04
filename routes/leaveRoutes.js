const express = require("express");
const router = express.Router();
const { submitLeave, reviewLeave, getMyLeaves } = require("../controllers/leaveControllers");
const { verifyToken, checkRole } = require("../middleware/auth");

router.post("/submit", verifyToken, submitLeave); // [cite: 11]
router.get("/my-history", verifyToken, getMyLeaves); // [cite: 13]
router.post("/review", verifyToken, checkRole(['manager', 'admin']), reviewLeave); // [cite: 19]

module.exports = router;