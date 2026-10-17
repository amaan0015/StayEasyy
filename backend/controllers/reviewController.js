
const mongoose = require("mongoose");
const Review = require("../models/Review");
const Property = require("../models/Property");

// Create a review
const createReview = async (req, res) => {
  try {
    const { propertyId, rating, comment } = req.body;
    const tenantId = req.user.userId;

    if (!mongoose.Types.ObjectId.isValid(propertyId)) {
      return res.status(400).json({
        message: "Invalid property ID.",
      });
    }

    const numericRating = Number(rating);
    const trimmedComment =
      typeof comment === "string" ? comment.trim() : "";

    if (
      !Number.isInteger(numericRating) ||
      numericRating < 1 ||
      numericRating > 5
    ) {
      return res.status(400).json({
        message: "Rating must be a whole number between 1 and 5.",
      });
    }

    if (
      trimmedComment.length < 10 ||
      trimmedComment.length > 1000
    ) {
      return res.status(400).json({
        message: "Comment must be between 10 and 1000 characters.",
      });
    }

    const property = await Property.findById(propertyId);

    if (!property) {
      return res.status(404).json({
        message: "Property not found.",
      });
    }

    if (property.status !== "approved") {
      return res.status(400).json({
        message: "You can only review approved properties.",
      });
    }

    if (
      property.owner &&
      property.owner.toString() === tenantId
    ) {
      return res.status(403).json({
        message: "You cannot review your own property.",
      });
    }

    const review = await Review.create({
      property: propertyId,
      tenant: tenantId,
      rating: numericRating,
      comment: trimmedComment,
    });

    await review.populate("tenant", "name");

    return res.status(201).json({
      message: "Review submitted successfully.",
      review,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "You have already reviewed this property.",
      });
    }

    console.error("Create review error:", error);

    return res.status(500).json({
      message: "Unable to submit review.",
    });
  }
};

// Get reviews for a property
const getPropertyReviews = async (req, res) => {
  try {
    const { propertyId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(propertyId)) {
      return res.status(400).json({
        message: "Invalid property ID.",
      });
    }

    const reviews = await Review.find({
      property: propertyId,
    })
      .populate("tenant", "name")
      .sort({ createdAt: -1 });

    const totalReviews = reviews.length;

    const averageRating =
      totalReviews === 0
        ? 0
        : Number(
            (
              reviews.reduce(
                (total, review) => total + review.rating,
                0
              ) / totalReviews
            ).toFixed(1)
          );

    return res.status(200).json({
      reviews,
      totalReviews,
      averageRating,
    });
  } catch (error) {
    console.error("Get reviews error:", error);

    return res.status(500).json({
      message: "Unable to fetch reviews.",
    });
  }
};

module.exports = {
  createReview,
  getPropertyReviews,
};
