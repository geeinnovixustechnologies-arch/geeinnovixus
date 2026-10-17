import mongoose from "mongoose";

const textArray = {
  type: [String],
  default: [],
  validate: {
    validator: (items) =>
      Array.isArray(items) &&
      items.every((item) => typeof item === "string" && item.trim().length > 0 && item.length <= 200),
    message: "Entries must be non-empty strings of at most 200 characters.",
  },
};

const researchSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, required: true, trim: true, maxlength: 2000 },
    category: { type: String, required: true, trim: true, maxlength: 100 },
    domain: { type: String, required: true, trim: true, maxlength: 100 },
    services: textArray,
    features: textArray,
    deliveryTime: { type: String, trim: true, maxlength: 100 },
    popularity: { type: Number, min: 0, max: 100, validate: Number.isFinite },
    rating: { type: Number, min: 0, max: 5, validate: Number.isFinite },
    icon: { type: String, trim: true, maxlength: 50 },
    color: {
      type: String,
      enum: ["primary", "secondary", "success", "warning", "info"],
      default: "primary",
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Research =
  mongoose.models.Research || mongoose.model("Research", researchSchema);

export default Research;
