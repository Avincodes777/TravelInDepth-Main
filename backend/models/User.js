import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: {
      type: String,
      required: function () {
        return this.authProvider === "local";
      },
    },
    googleId: { type: String, unique: true, sparse: true },
    authProvider: { type: String, enum: ["local", "google"], default: "local" },
    phone: { type: String, default: "" },
    location: { type: String, default: "" },
    bio: { type: String, default: "" },
    avatar: { type: String, default: "" },
    settings: {
      emailNotifications: { type: Boolean, default: true },
      pushNotifications: { type: Boolean, default: true },
      darkMode: { type: Boolean, default: false },
      currency: { type: String, default: "INR" },
    },
    interests: { type: [String], default: [] },
    contributions: {
      type: [
        {
          destinationName: String,
          destinationSlug: String,
          contributedAt: Date,
        },
      ],
      default: [],
    },
    isContributor: { type: Boolean, default: false },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    resetPasswordToken: { type: String, default: null },
    resetPasswordExpires: { type: Date, default: null },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.password || !this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = function (candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model("User", userSchema);