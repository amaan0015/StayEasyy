
const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const {
  createReview,
  getPropertyReviews,
} = require("../controllers/reviewController");

// Public: view reviews for a property
router.get("/:propertyId", getPropertyReviews);

// Tenants only: submit a review
router.post(
  "/",
  protect,
  authorizeRoles("tenant"),
  createReview
);

module.exports = router;
