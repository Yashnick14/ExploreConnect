import Place from '../models/PlacesModel.js';
import mongoose from 'mongoose';

// GET all
export const getPlaces = async (req, res) => {
  try {
    const places = await Place.find({});
    res.status(200).json({ success: true, data: places });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET latest 4
export const getLatestPlaces = async (req, res) => {
  try {
    const places = await Place.find({})
                              .sort({ createdAt: -1 })
                              .limit(4);
    res.status(200).json({ success: true, data: places });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// POST create
export const createPlace = async (req, res) => {
  const {
    name, description, location, district,
    category, contactNumber, workingHours,
    petsAllowed, lat, lng
  } = req.body;
  const images = req.files?.images || [];

  if (
    !name || !description || !location || !district ||
    !category || !contactNumber || !workingHours ||
    images.length === 0 || lat == null || lng == null
  ) {
    return res.status(400)
      .json({ success: false, message: "Missing required fields, images or coordinates" });
  }

  //— validations
  const hoursRX = /^([1-9]|1[0-2])(am|pm)-([1-9]|1[0-2])(am|pm)$/i;
  const phoneRX = /^\d{10}$/;
  if (!hoursRX.test(workingHours))
    return res.status(400).json({
      success: false,
      message: "Working hours must be like 9am-5pm (12h format)."
    });
  if (!phoneRX.test(contactNumber))
    return res.status(400).json({
      success: false,
      message: "Contact number must be exactly 10 digits."
    });

  const latNum = parseFloat(lat), lngNum = parseFloat(lng);
  if (
    isNaN(latNum) || latNum < -90 || latNum > 90 ||
    isNaN(lngNum) || lngNum < -180 || lngNum > 180
  ) {
    return res.status(400).json({
      success: false,
      message: "Latitude/longitude invalid."
    });
  }

  try {
    if (await Place.findOne({ name }))
      return res.status(409).json({ success: false, message: "Place already exists" });

    const filenames = images.map(f => f.filename);
    const newPlace = new Place({
      name, description, location, district,
      category, contactNumber, workingHours,
      petsAllowed: petsAllowed === 'true' || petsAllowed === true,
      images: filenames,
      lat: latNum, lng: lngNum
    });
    await newPlace.save();
    res.status(201).json({ success: true, data: newPlace });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// PUT update
export const updatePlace = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(400).json({ success: false, message: "Invalid ID" });

  const {
    name, description, location, district,
    category, contactNumber, workingHours,
    petsAllowed, lat, lng
  } = req.body;
  const images = req.files?.images || [];

  // same validations as create…
  const hoursRX = /^([1-9]|1[0-2])(am|pm)-([1-9]|1[0-2])(am|pm)$/i;
  const phoneRX = /^\d{10}$/;
  if (!hoursRX.test(workingHours))
    return res.status(400).json({ success:false, message:"Hours must be like 9am-5pm." });
  if (!phoneRX.test(contactNumber))
    return res.status(400).json({ success:false, message:"Phone must be 10 digits." });
  const latNum = parseFloat(lat), lngNum = parseFloat(lng);
  if (
    isNaN(latNum)||latNum<-90||latNum>90||
    isNaN(lngNum)||lngNum<-180||lngNum>180
  ) {
    return res.status(400).json({ success:false, message:"Invalid coords." });
  }

  try {
    const existing = await Place.findById(id);
    if (!existing)
      return res.status(404).json({ success: false, message: "Not found" });

    // merge images
    let final = [...existing.images];
    images.forEach(f => final.length<4 && final.push(f.filename));
    if (req.body.removedIndexes) {
      JSON.parse(req.body.removedIndexes)
        .sort((a,b)=>b-a)
        .forEach(idx => final.splice(idx,1));
    }
    if (final.length===0)
      return res.status(400).json({ success:false, message:"At least one image required." });

    const upd = {
      name, description, location, district,
      category, contactNumber, workingHours,
      petsAllowed: petsAllowed==='true'||petsAllowed===true,
      images: final.slice(0,4),
      lat: latNum, lng: lngNum
    };
    const updated = await Place.findByIdAndUpdate(id, upd, { new: true });
    res.status(200).json({ success:true, data: updated });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success:false, message:"Server error" });
  }
};

// DELETE
export const deletePlace = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(400).json({ success:false, message:"Invalid ID" });
  try {
    await Place.findByIdAndDelete(id);
    res.status(200).json({ success:true, message:"Deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success:false, message:"Server error" });
  }
};

// GET distinct filters
export const getUniqueFilters = async (req, res) => {
  try {
    const categories = await Place.distinct("category");
    const districts = await Place.distinct("district");
    res.status(200).json({ success: true, categories, districts });
  } catch (error) {
    console.error("Error fetching filters:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET places by search
export const searchPlaces = async (req, res) => {
  const query = req.query.q;

  if (!query) {
    return res.status(400).json({ success: false, message: "Search query missing" });
  }

  try {
    const results = await Place.find({
      name: { $regex: query, $options: "i" }
    });

    res.status(200).json({ success: true, data: results });
  } catch (error) {
    console.error("Search error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET place by ID
export const getPlaceById = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: "Invalid place ID" });
  }

  try {
    const place = await Place.findById(id);
    if (!place) {
      return res.status(404).json({ success: false, message: "Place not found" });
    }
    res.status(200).json({ success: true, data: place });
  } catch (error) {
    console.error("Error fetching place by ID:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
