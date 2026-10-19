import mongoose from "mongoose";

const certificateSchema = new mongoose.Schema(
  {
    studentName: { type: String, required: true, trim: true, maxlength: 120 },
    domain: { type: String, required: true, trim: true, maxlength: 160 },
    duration: { type: String, required: true, trim: true, maxlength: 160 },
    status: { type: String, enum: ["verified"], default: "verified" },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    issuedAt: { type: Date, required: true },
    provider: { type: String, required: true, trim: true, maxlength: 160 },
    certificateId: { type: String, required: true, trim: true, maxlength: 64, unique: true },
    certificateUrl: { type: String, required: true, trim: true, maxlength: 2048 },
  },
  { timestamps: true }
);

const Certificate =
  mongoose.models.Certificate || mongoose.model("Certificate", certificateSchema);

export default Certificate;
