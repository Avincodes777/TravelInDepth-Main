import mongoose from "mongoose";

const ecoImpactSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    actionType: {
      type: String,
      enum: [
        "public_transit",
        "eco_lodge",
        "reusable_bottle",
        "local_vendor",
        "zero_waste_meal",
        "cycling_walking",
        "tree_planted",
        "custom",
      ],
      default: "public_transit",
    },
    title: {
      type: String,
      trim: true,
      default: "Sustainable Travel Choice",
    },
    carbonSavedKg: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    bottlesPrevented: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    localSpentUSD: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    ecoBadgeLevel: {
      type: String,
      enum: ["Eco-Novice", "Green Voyager", "Planet Guardian"],
      default: "Eco-Novice",
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("EcoImpact", ecoImpactSchema);
