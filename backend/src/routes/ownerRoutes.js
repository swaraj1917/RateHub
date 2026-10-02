const express = require("express");

const { getDashboard } = require("../controllers/ownerController");

const {
  authenticate,
  authorize,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
  "/dashboard",
  authenticate,
  authorize("STORE_OWNER"),
  getDashboard
);

module.exports = router;