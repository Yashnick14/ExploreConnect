import mongoose from "mongoose";

const RegistrationSchema = new mongoose.Schema(
  {
    place: { type: mongoose.Schema.Types.ObjectId, ref: "Place", required: true },

    // who is registering
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },

    // when
    date: { type: Date, required: true }, // we'll parse dd/MM/yyyy into a Date
    time: { type: String, required: true, trim: true }, // keep as "10:00 AM" or similar

    // how many
    people: { type: Number, default: 1, min: 1 },

    status: { type: String, enum: ["pending", "approved", "confirmed", "cancelled"], default: "pending" },
  },
  { timestamps: true }
);

export default mongoose.model("Registration", RegistrationSchema);
