import mongoose from 'mongoose';

const placeSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    district: {
        type: String,
        required: true
    },
    images: {
    type: [String],
    required: true,
    validate: v => Array.isArray(v) && v.length > 0
    },
    category: { 
        type: String, 
        required: true 
    },
    contactNumber: { 
        type: String, 
        required: true 
    },
    workingHours: { 
        type: String, 
        required: true 
    },
    petsAllowed: { 
        type: Boolean, 
        required: true 
    },
},{
    timestamps: true //created at, updated at
});

placeSchema.index({ name: 1, category: 1 }, { unique: true });

const Place = mongoose.model('Place', placeSchema);

export default Place;