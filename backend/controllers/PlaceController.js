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
  const place = req.body;

  if (
    !place.name ||
    !place.description ||
    !place.location ||
    !place.district ||
    !place.image ||
    !place.category ||
    !place.contactNumber ||
    !place.workingHours
  ) {
    return res
      .status(400)
      .json({ success: false, message: "Please provide all required fields" });
  }

  try {
    // Check for duplicate place by name and category
    const existingPlace = await Place.findOne({
      name: place.name
    });

    if (existingPlace) {
      return res
        .status(409)
        .json({ success: false, message: "Place already exists" });
    }

    const newPlace = new Place(place);
    await newPlace.save();
    res.status(201).json({ success: true, data: newPlace });
  } catch (error) {
    console.error("Error in creating place:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updatePlace = async (req, res) => {
    const {id} = req.params;
    const place = req.body; // user will send this data

    if(!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({success:false, message: "Invalid place ID"});
    }

    try {
       const updatedPlace = await Place.findByIdAndUpdate(id, place, {new: true}); // update the place with the new data
       res.status(200).json({success:true, data: updatedPlace});
    } catch (error) {
        res.status(500).json({success:false, message: "Server error"});

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