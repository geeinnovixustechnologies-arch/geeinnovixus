import mongoose from "mongoose";

const galleryImageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true, trim: true },
    altText: { type: String, required: true, trim: true, maxlength: 300 },
    caption: { type: String, required: true, trim: true, maxlength: 500 },
    category: {
      type: String,
      required: true,
      enum: ["event", "course"],
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const GalleryImage =
  mongoose.models.GalleryImage ||
  mongoose.model("GalleryImage", galleryImageSchema);

export default GalleryImage;
