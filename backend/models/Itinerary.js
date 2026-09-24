import mongoose from "mongoose";

const travelInfoSchema = new mongoose.Schema(
  {
    travelMinutes: { type: Number },
    travelKm: { type: Number },
    estimated: { type: Boolean, default: false }
  },
  { _id: false }
);

const activitySchema = new mongoose.Schema(
  {
    time: { type: String },
    placeName: { type: String, required: true },
    activity: { type: String, required: true },
    reason: { type: String },
    estimatedDurationMinutes: { type: Number, default: 120 },
    lat: { type: Number, default: 0 },
    lng: { type: Number, default: 0 },
    travelFromPrevious: { type: travelInfoSchema, default: null },
  },
  { _id: false }
);

const dayPlanSchema = new mongoose.Schema(
  {
    day: { type: Number, required: true },
    city: { type: String, default: "" },
    title: { type: String, required: true },
    activities: { type: [activitySchema], default: [] },
    morning: { type: String },
    afternoon: { type: String },
    evening: { type: String },
    meals: { type: String, default: "" },
    estimatedBudgetINR: { type: String, default: "" },
    tips: { type: String },
  },
  { _id: false }
);

const itinerarySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    destination: { type: String, required: true },
    cities: { type: [String], default: [] },
    days: { type: [dayPlanSchema], required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Itinerary", itinerarySchema);
