import Place from '../models/PlacesModel.js'; // import the Place model
import mongoose from 'mongoose';


export  const getPlaces = async (req, res) => {
    try {
        const places = await Place.find({}); // find all places
        res.status(200).json({success:true, data: places}); // send the places as a response
    } catch (error) {
        console.log("Error in fetching places:", error.message);
        res.status(500).json({success:false, message: "Server error"}); // send an error response
    }
};

export const getLatestPlaces = async (req, res) => {
  try {
    const places = await Place.find({})
      .sort({ createdAt: -1 }) // newest first
      .limit(4);               // only last 4
    res.status(200).json({ success: true, data: places });
  } catch (error) {
    console.error("Error fetching latest places:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const createPlace = async (req, res) => {
  const {
    name, description, location, district,
    category, contactNumber, workingHours, petsAllowed,
  } = req.body;

  const imageFiles = req.files?.images || [];

  if (
    !name || !description || !location || !district ||
    !category || !contactNumber || !workingHours || imageFiles.length === 0
  ) {
    return res.status(400).json({ success: false, message: "Missing required fields or image" });
  }

  try {
    const existingPlace = await Place.findOne({ name });
    if (existingPlace) {
      return res.status(409).json({ success: false, message: "Place already exists" });
    }

    const imageFilenames = imageFiles.map(file => file.filename);

    const newPlace = new Place({
      name,
      description,
      location,
      district,
      category,
      contactNumber,
      workingHours,
      petsAllowed: petsAllowed === 'true' || petsAllowed === true,
      images: imageFilenames,
    });

    await newPlace.save();
    res.status(201).json({ success: true, data: newPlace });
  } catch (error) {
    console.error("Place creation error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updatePlace = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: "Invalid place ID" });
  }

  try {
    const {
      name, description, location, district,
      category, contactNumber, workingHours, petsAllowed
    } = req.body;

    const imageFiles = req.files?.images || [];

    const updatedFields = {
      name,
      description,
      location,
      district,
      category,
      contactNumber,
      workingHours,
      petsAllowed: petsAllowed === 'true' || petsAllowed === true,
    };

    if (imageFiles.length > 0) {
      updatedFields.images = imageFiles.map(file => file.filename);
    }

    const updatedPlace = await Place.findByIdAndUpdate(id, updatedFields, { new: true });
    res.status(200).json({ success: true, data: updatedPlace });
  } catch (error) {
    console.error("Error updating place:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const deletePlace = async (req, res) => {
    const {id} = req.params; // get the id from the url

        if(!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({success:false, message: "Invalid place ID"});
    }
    
   try{
    await Place.findByIdAndDelete(id);
    res.status(200).json({success:true, message: "Place deleted successfully"});
   } catch(error) {
    console.log("Error in deleting place:", error.message);
    res.status(500).json({success:false, message: "Server error"});
   }
};

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

export const searchPlaces = async (req, res) => {
  const query = req.query.q;

  if (!query) {
    return res.status(400).json({ success: false, message: "Search query missing" });
  }

  try {
    const results = await Place.find({
      name: { $regex: query, $options: "i" } // case-insensitive search
    });

    res.status(200).json({ success: true, data: results });
  } catch (error) {
    console.error("Search error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
