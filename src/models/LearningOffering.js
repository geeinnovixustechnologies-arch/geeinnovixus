import mongoose from "mongoose";
import {
  learningCategories,
  learningLevels,
} from "../lib/learning-offering-options.js";

const learningOfferingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    shortDescription: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },
    category: {
      type: String,
      required: true,
      enum: learningCategories,
    },
    level: {
      type: String,
      required: true,
      enum: learningLevels,
    },
    duration: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    modules: {
      type: [{ type: String, trim: true }],
      default: [],
    },
    software: {
      type: [{ type: String, trim: true }],
      default: [],
    },
    features: {
      type: [{ type: String, trim: true }],
      default: [],
    },
    image: {
      url: { type: String, trim: true },
      altText: { type: String, trim: true },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const LearningOffering =
  mongoose.models.LearningOffering ||
  mongoose.model("LearningOffering", learningOfferingSchema);

export default LearningOffering;
