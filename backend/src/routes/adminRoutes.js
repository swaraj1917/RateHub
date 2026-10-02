const express = require("express");

const {
  createUser,
  createStore,
  listUsers,
  listStores,
  getUserDetails,
  getDashboardStats,
} = require("../controllers/adminController");

const {
  authenticate,
  authorize,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/users", authenticate, authorize("ADMIN"), createUser);

router.post("/stores", authenticate, authorize("ADMIN"), createStore);

router.get("/users", authenticate, authorize("ADMIN"), listUsers);

router.get(
  "/dashboard",
  authenticate,
  authorize("ADMIN"),
  getDashboardStats
);

router.get(
  "/users/:id",
  authenticate,
  authorize("ADMIN"),
  getUserDetails
);

router.get("/stores", authenticate, authorize("ADMIN"), listStores);

module.exports = router;