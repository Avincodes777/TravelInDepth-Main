import Wishlist from "../models/Wishlist.js";
import Destination from "../models/Destination.js";

// 1. Add destination to wishlist (POST /api/wishlist/:slug)
export const addToWishlist = async (req, res) => {
  try {
    const { slug } = req.params;

    if (!slug) {
      return res.status(400).json({ message: "Destination slug is required" });
    }

    // Verify destination exists in the database
    const destination = await Destination.findOne({ slug });
    if (!destination) {
      return res.status(404).json({ message: "Destination not found" });
    }

    let item;
    try {
      item = await Wishlist.create({
        userId: req.userId,
        destinationSlug: slug,
      });
    } catch (createErr) {
      // If duplicate key error (code 11000), treat as idempotent success
      if (createErr.code === 11000) {
        item = await Wishlist.findOne({
          userId: req.userId,
          destinationSlug: slug,
        });
      } else {
        throw createErr;
      }
    }

    return res.status(200).json({
      message: "Destination added to wishlist",
      item,
    });
  } catch (err) {
    console.error("Failed to add to wishlist:", err.message);
    return res.status(500).json({
      message: "Failed to add destination to wishlist",
      error: err.message,
    });
  }
};

// 2. Remove destination from wishlist (DELETE /api/wishlist/:slug)
export const removeFromWishlist = async (req, res) => {
  try {
    const { slug } = req.params;

    if (!slug) {
      return res.status(400).json({ message: "Destination slug is required" });
    }

    await Wishlist.findOneAndDelete({
      userId: req.userId,
      destinationSlug: slug,
    });

    return res.status(200).json({
      message: "Destination removed from wishlist",
      slug,
    });
  } catch (err) {
    console.error("Failed to remove from wishlist:", err.message);
    return res.status(500).json({
      message: "Failed to remove destination from wishlist",
      error: err.message,
    });
  }
};

// 3. Get list of wishlisted destination slugs (GET /api/wishlist/slugs)
export const getMyWishlistSlugs = async (req, res) => {
  try {
    const items = await Wishlist.find({ userId: req.userId }).select("destinationSlug -_id");
    const slugs = items.map((item) => item.destinationSlug);

    return res.status(200).json(slugs);
  } catch (err) {
    console.error("Failed to fetch wishlist slugs:", err.message);
    return res.status(500).json({
      message: "Failed to fetch wishlist slugs",
      error: err.message,
    });
  }
};

// 4. Get full wishlist with populated destination details (GET /api/wishlist)
export const getMyWishlist = async (req, res) => {
  try {
    const wishlistItems = await Wishlist.find({ userId: req.userId }).sort({ addedAt: -1 });

    if (wishlistItems.length === 0) {
      return res.status(200).json([]);
    }

    const slugs = wishlistItems.map((item) => item.destinationSlug);

    // Fetch corresponding destination details
    const destinations = await Destination.find({ slug: { $in: slugs } })
      .select("name slug image budget bestSeason region rating tagline");

    const destinationMap = new Map();
    destinations.forEach((dest) => {
      destinationMap.set(dest.slug, dest);
    });

    // Combine data in sorted order by addedAt descending; skip gracefully if destination was deleted
    const result = [];
    for (const item of wishlistItems) {
      const dest = destinationMap.get(item.destinationSlug);
      if (dest) {
        result.push({
          wishlistId: item._id,
          addedAt: item.addedAt,
          name: dest.name,
          slug: dest.slug,
          image: dest.image,
          budget: dest.budget,
          bestSeason: dest.bestSeason,
          region: dest.region,
          rating: dest.rating,
          tagline: dest.tagline,
        });
      }
    }

    return res.status(200).json(result);
  } catch (err) {
    console.error("Failed to fetch full wishlist:", err.message);
    return res.status(500).json({
      message: "Failed to fetch wishlist",
      error: err.message,
    });
  }
};
