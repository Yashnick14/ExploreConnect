// server/models/RegistrationEditRequestModel.js
import mongoose from "mongoose";

const RegistrationEditSchema = new mongoose.Schema(
  {
    registration: { type: mongoose.Schema.Types.ObjectId, ref: "Registration", required: true },
    userEmail: { type: String, required: true, lowercase: true },
    patch: {
      phone: String,
      time: String,
      people: Number,
      date: String, // dd/MM/yyyy (server will convert on approve)
    },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    adminNote: { type: String },
    appliedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model("RegistrationEdit", RegistrationEditSchema);
