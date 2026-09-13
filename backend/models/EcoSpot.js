import mongoose from "mongoose";

const ecoSpotSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [140, "Title cannot exceed 140 characters"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: {
        values: [
          "Refill Station",
          "Zero-Waste Eatery",
          "Public Transit Tip",
          "Eco-Alert",
        ],
        message: "{VALUE} is not a valid eco spot category",
      },
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
      maxlength: [150, "Location cannot exceed 150 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: [1500, "Description cannot exceed 1500 characters"],
    },
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    submitterName: {
      type: String,
      trim: true,
      default: "Green Explorer",
    },
    upvotes: {
      type: Number,
      default: 0,
      min: 0,
    },
    upvotedBy: {
      type: [String],
      default: [],
    },
    isAutomated: {
      type: Boolean,
      default: false,
    },
    sourceType: {
      type: String,
      enum: ["seeded", "live-api", "user-submitted"],
      default: "user-submitted",
    },
    source: {
      type: String,
      trim: true,
      default: "Community",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("EcoSpot", ecoSpotSchema);
