import mongoose from "mongoose";

const photoItemSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, default: "" },
    caption: { type: String, default: "", trim: true },
  },
  { _id: true }
);

const journalEntrySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    locationName: {
      type: String,
      required: [true, "Location name is required"],
      trim: true,
    },
    date: {
      type: String,
      required: [true, "Date is required"],
      trim: true,
    },
    time: {
      type: String,
      default: "",
      trim: true,
    },
    title: {
      type: String,
      trim: true,
      default: "",
    },
    note: {
      type: String,
      default: "",
    },
    mood: {
      type: String,
      default: "Adventurous",
      trim: true,
    },
    photos: {
      type: [photoItemSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("JournalEntry", journalEntrySchema);
