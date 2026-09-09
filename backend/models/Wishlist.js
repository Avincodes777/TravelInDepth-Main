import mongoose from "mongoose";

const wishlistSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    destinationSlug: {
      type: String,
      required: true,
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Compound unique index ensuring a user can only wishlist a destination once
wishlistSchema.index({ userId: 1, destinationSlug: 1 }, { unique: true });

export default mongoose.model("Wishlist", wishlistSchema);
