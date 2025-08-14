import Place from '../models/PlacesModel.js';
import mongoose from 'mongoose';

const hoursRX =
  /^([1-9]|1[0-2])(:[0-5][0-9])?\s?(am|pm)\s*-\s*([1-9]|1[0-2])(:[0-5][0-9])?\s?(am|pm)$/i;
const phoneRX = /^\d{10}$/;
const timeRX = /^\d{2}:\d{2}$/; // HH:MM (24h) used by weekly editor

const isBlank = (v) => v == null || (typeof v === 'string' && v.trim() === '');

function getUploadedImages(files) {
  // Multer may give: req.files (array), or req.files.images (array), or nothing
  if (Array.isArray(files)) return files;
  if (files && Array.isArray(files.images)) return files.images;
  return [];
}

function parseWeekly(raw) {
  if (!raw) return undefined;
  try {
    const arr = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (!Array.isArray(arr) || arr.length !== 7) return undefined;

    // Normalize shape: support "day" or "key" ("Mon", "Tue", ...)
    const cleaned = arr.map((d) => ({
      day: String(d.day || d.key || ''), // store the short code
      isOpen: !!d.isOpen,
      open: d.open || '',
      close: d.close || '',
    }));

    for (const d of cleaned) {
      if (d.isOpen && (!timeRX.test(d.open) || !timeRX.test(d.close))) {
        return undefined;
      }
    }
    return cleaned;
  } catch {
    return undefined;
  }
}

// GET all
export const getPlaces = async (req, res) => {
  try {
    const places = await Place.find({});
    res.status(200).json({ success: true, data: places });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET latest 4
export const getLatestPlaces = async (req, res) => {
  try {
    const places = await Place.find({}).sort({ createdAt: -1 }).limit(4);
    res.status(200).json({ success: true, data: places });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// POST create
export const createPlace = async (req, res) => {
  try {
    const {
      name,
      description,
      location,
      district,
      category,
      contactNumber,
      workingHours,
      petsAllowed,
      lat,
      lng,
      workingHoursWeekly,
    } = req.body;

    const images = getUploadedImages(req.files);

    // Required text fields
    const required = {
      name,
      description,
      location,
      district,
      category,
      contactNumber,
      workingHours,
    };
    for (const [k, v] of Object.entries(required)) {
      if (isBlank(v)) {
        return res
          .status(400)
          .json({ success: false, message: `Missing required field: ${k}` });
      }
    }

    if (!images || images.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: 'At least one image is required.' });
    }

    // Validate formats
    if (!hoursRX.test(workingHours)) {
      return res.status(400).json({
        success: false,
        message:
          'Working hours must be like 9am-5pm or 9:00 AM-5:00 PM (12h format).',
      });
    }
    if (!phoneRX.test(contactNumber)) {
      return res.status(400).json({
        success: false,
        message: 'Contact number must be exactly 10 digits.',
      });
    }

    // Coords
    const latNum = Number(lat);
    const lngNum = Number(lng);
    if (!Number.isFinite(latNum) || !Number.isFinite(lngNum)) {
      return res
        .status(400)
        .json({ success: false, message: 'Latitude/longitude invalid.' });
    }
    if (latNum < -90 || latNum > 90 || lngNum < -180 || lngNum > 180) {
      return res.status(400).json({
        success: false,
        message: 'Latitude/longitude out of range.',
      });
    }

    // Optional weekly schedule
    const weekly = parseWeekly(workingHoursWeekly);
    if (workingHoursWeekly && !weekly) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid weekly hours payload.' });
    }

    if (await Place.findOne({ name })) {
      return res
        .status(409)
        .json({ success: false, message: 'Place already exists' });
    }

    const filenames = images.map((f) => f.filename);

    const payload = {
      name,
      description,
      location,
      district,
      category,
      contactNumber,
      workingHours,
      workingHoursWeekly: weekly,
      petsAllowed: petsAllowed === 'true' || petsAllowed === true,
      images: filenames,
      lat: latNum,
      lng: lngNum,
    };

    const doc = new Place(payload);
    await doc.save();
    return res.status(201).json({ success: true, data: doc });
  } catch (err) {
    console.error('Place creation error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// PUT update
export const updatePlace = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: 'Invalid ID' });
  }

  try {
    const {
      name,
      description,
      location,
      district,
      category,
      contactNumber,
      workingHours,
      petsAllowed,
      lat,
      lng,
      workingHoursWeekly,
    } = req.body;

    const images = getUploadedImages(req.files);

    // Validate formats
    if (!hoursRX.test(workingHours)) {
      return res.status(400).json({
        success: false,
        message: 'Hours must be like 9am-5pm or 9:00 AM-5:00 PM.',
      });
    }
    if (!phoneRX.test(contactNumber)) {
      return res
        .status(400)
        .json({ success: false, message: 'Phone must be 10 digits.' });
    }

    const latNum = Number(lat);
    const lngNum = Number(lng);
    if (!Number.isFinite(latNum) || !Number.isFinite(lngNum)) {
      return res
        .status(400)
        .json({ success: false, message: 'Latitude/longitude invalid.' });
    }
    if (latNum < -90 || latNum > 90 || lngNum < -180 || lngNum > 180) {
      return res
        .status(400)
        .json({ success: false, message: 'Latitude/longitude out of range.' });
    }

    const weekly = parseWeekly(workingHoursWeekly);
    if (workingHoursWeekly && !weekly) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid weekly hours payload.' });
    }

    const existing = await Place.findById(id);
    if (!existing)
      return res.status(404).json({ success: false, message: 'Not found' });

    // Merge images
    let final = [...existing.images];
    images.forEach((f) => final.length < 4 && final.push(f.filename));
    if (req.body.removedIndexes) {
      try {
        JSON.parse(req.body.removedIndexes)
          .sort((a, b) => b - a)
          .forEach((idx) => final.splice(idx, 1));
      } catch {}
    }
    if (final.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: 'At least one image required.' });
    }

    const upd = {
      name,
      description,
      location,
      district,
      category,
      contactNumber,
      workingHours,
      workingHoursWeekly: weekly ?? existing.workingHoursWeekly,
      petsAllowed: petsAllowed === 'true' || petsAllowed === true,
      images: final.slice(0, 4),
      lat: latNum,
      lng: lngNum,
    };

    // Allow clearing weekly schedule by sending empty string
    if (workingHoursWeekly === '') upd.workingHoursWeekly = undefined;

    const updated = await Place.findByIdAndUpdate(id, upd, { new: true });
    return res.status(200).json({ success: true, data: updated });
  } catch (err) {
    console.error('Update place error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// DELETE
export const deletePlace = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(400).json({ success: false, message: 'Invalid ID' });
  try {
    await Place.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: 'Deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Filters / search / byId
export const getUniqueFilters = async (req, res) => {
  try {
    const categories = await Place.distinct('category');
    const districts = await Place.distinct('district');
    res.status(200).json({ success: true, categories, districts });
  } catch (error) {
    console.error('Error fetching filters:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const searchPlaces = async (req, res) => {
  const query = req.query.q;
  if (!query)
    return res
      .status(400)
      .json({ success: false, message: 'Search query missing' });
  try {
    const results = await Place.find({
      name: { $regex: query, $options: 'i' },
    });
    res.status(200).json({ success: true, data: results });
  } catch (error) {
    console.error('Search error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getPlaceById = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: 'Invalid place ID' });
  }
  try {
    const place = await Place.findById(id);
    if (!place)
      return res
        .status(404)
        .json({ success: false, message: 'Place not found' });
    res.status(200).json({ success: true, data: place });
  } catch (error) {
    console.error('Error fetching place by ID:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
