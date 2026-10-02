const express = require("express");

const {
  listStores,
  submitRating,
  modifyRating,
} = require("../controllers/userController");

const {
  authenticate,
  authorize,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
  "/stores",
  authenticate,
  authorize("USER"),
  listStores
);

router.post(
  "/stores/:storeId/rating",
  authenticate,
  authorize("USER"),
  submitRating
);

router.put(
  "/stores/:storeId/rating",
  authenticate,
  authorize("USER"),
  modifyRating
);

module.exports = router;