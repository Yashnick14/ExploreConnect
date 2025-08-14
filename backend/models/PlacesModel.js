import mongoose from 'mongoose';

// Optional weekly hours sub-schema
const weeklyHoursSchema = new mongoose.Schema(
  {
    day: { type: String, required: true },   // "Mon", "Tue", ...
    isOpen: { type: Boolean, default: false },
    open: { type: String, default: '' },     // "HH:MM" 24h
    close: { type: String, default: '' },    // "HH:MM" 24h
  },
  { _id: false }
);

const placeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  district: { type: String, required: true },
  images: {
    type: [String],
    required: true,
    validate: v => Array.isArray(v) && v.length > 0
  },
  category: { type: String, required: true },
  contactNumber: { type: String, required: true },

  // Your existing compact string (keep it)
  workingHours: { type: String, required: true },

  // NEW: full weekly schedule (optional)
  workingHoursWeekly: {
    type: [weeklyHoursSchema],
    default: undefined
  },

  petsAllowed: { type: Boolean, required: true },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
}, {
  timestamps: true
});

placeSchema.index({ name: 1, category: 1 }, { unique: true });

const Place = mongoose.model('Place', placeSchema);
export default Place;
