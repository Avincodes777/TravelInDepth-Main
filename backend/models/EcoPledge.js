import mongoose from "mongoose";

const ecoPledgeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    userName: {
      type: String,
      trim: true,
      default: "Conscious Explorer",
    },
    tripDestination: {
      type: String,
      required: [true, "Trip destination is required"],
      trim: true,
      maxlength: [120, "Destination cannot exceed 120 characters"],
    },
    pledges: {
      type: [String],
      required: [true, "At least one pledge commitment is required"],
      validate: {
        validator: function (val) {
          return Array.isArray(val) && val.length > 0;
        },
        message: "Please select at least one micro-action commitment.",
      },
    },
    stampId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    pledgeDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("EcoPledge", ecoPledgeSchema);
