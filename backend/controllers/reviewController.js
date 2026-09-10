import Review from "../models/Review.js";
import User from "../models/User.js";

/**
 * Fetch all reviews sorted by newest first
 * GET /api/reviews
 */
export const getAllReviews = async (req, res) => {
  try {
    const { category, rating, sort } = req.query;

    const query = {};
    if (category && category !== "All") {
      query.category = category;
    }
    if (rating && !isNaN(Number(rating))) {
      query.rating = Number(rating);
    }

    let sortOption = { createdAt: -1 };
    if (sort === "oldest") sortOption = { createdAt: 1 };
    if (sort === "highest") sortOption = { rating: -1, createdAt: -1 };
    if (sort === "lowest") sortOption = { rating: 1, createdAt: -1 };

    const reviews = await Review.find(query)
      .populate("user", "name email role")
      .sort(sortOption)
      .lean();

    return res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch reviews. Please try again later.",
      error: error.message,
    });
  }
};

/**
 * Fetch reviews created by current authenticated user
 * GET /api/reviews/my
 */
export const getMyReviews = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const reviews = await Review.find({ user: req.userId })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    console.error("Error fetching my reviews:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch your reviews.",
      error: error.message,
    });
  }
};

/**
 * Create a new review
 * POST /api/reviews
 */
export const createReview = async (req, res) => {
  try {
    const { name, rating, category, comment } = req.body;

    // Validation
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please provide your name.",
      });
    }

    const numRating = Number(rating);
    if (!numRating || isNaN(numRating) || numRating < 1 || numRating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be a number between 1 and 5.",
      });
    }

    const validCategories = ["Location", "Website", "Issue/Bug", "General"];
    if (!category || !validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: `Category must be one of: ${validCategories.join(", ")}`,
      });
    }

    if (!comment || !comment.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please provide a detailed comment/review.",
      });
    }

    const reviewData = {
      name: name.trim(),
      rating: numRating,
      category,
      comment: comment.trim(),
    };

    if (req.userId) {
      reviewData.user = req.userId;
    }

    const review = await Review.create(reviewData);

    return res.status(201).json({
      success: true,
      message: "Your review has been successfully submitted!",
      data: review,
    });
  } catch (error) {
    console.error("Error creating review:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to submit review.",
    });
  }
};

/**
 * Delete a review
 * DELETE /api/reviews/:id
 * Allows deletion by creator, admin, or any user if guest review
 */
export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found.",
      });
    }

    // Check authorization:
    // Deletion is denied by default unless the requester is authenticated
    // and is either an admin or the review's owner.
    // Guest reviews (no user field) can ONLY be deleted by an admin.
    if (!req.userId) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to delete this review.",
      });
    }

    const user = await User.findById(req.userId);
    const isAdmin = user && user.role === "admin";
    const isOwner = Boolean(review.user && review.user.toString() === req.userId.toString());

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to delete this review.",
      });
    }

    await Review.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Review deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting review:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete review.",
      error: error.message,
    });
  }
};
