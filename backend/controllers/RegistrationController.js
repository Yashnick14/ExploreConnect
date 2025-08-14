// controllers/registrationController.js
import Registration from "../models/RegistrationsModel.js";
import mongoose from "mongoose";

// dd/MM/yyyy -> Date
function parseDDMMYYYY(str) {
  if (!str || typeof str !== "string") return null;
  const [dd, mm, yyyy] = str.split("/").map(Number);
  if (!dd || !mm || !yyyy) return null;
  const d = new Date(yyyy, mm - 1, dd);
  if (d.getFullYear() !== yyyy || d.getMonth() !== mm - 1 || d.getDate() !== dd) return null;
  return d;
}

export const createRegistration = async (req, res) => {
  try {
    const { placeId, name, email, phone, date, time, people } = req.body;

    if (!placeId || !mongoose.Types.ObjectId.isValid(placeId)) {
      return res.status(400).json({ success: false, message: "Invalid placeId" });
    }
    if (!name || !email || !phone || !date || !time) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const dateObj = parseDDMMYYYY(date);
    if (!dateObj) {
      return res.status(400).json({ success: false, message: "Date must be DD/MM/YYYY" });
    }

    const reg = await Registration.create({
      place: placeId,
      name,
      email,
      phone,
      date: dateObj,
      time,
      people: Number(people || 1),
      status: "pending",
    });

    res.status(201).json({ success: true, data: reg });
  } catch (err) {
    console.error("Create registration error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const listRegistrations = async (req, res) => {
  try {
    const { place } = req.query;
    const filter = {};
    if (place && mongoose.Types.ObjectId.isValid(place)) filter.place = place;

    const regs = await Registration.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: regs });
  } catch (err) {
    console.error("List registrations error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getRegistrationById = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(400).json({ success: false, message: "Invalid ID" });

  try {
    const reg = await Registration.findById(id);
    if (!reg) return res.status(404).json({ success: false, message: "Not found" });
    res.status(200).json({ success: true, data: reg });
  } catch (err) {
    console.error("Get registration error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const deleteRegistration = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(400).json({ success: false, message: "Invalid ID" });

  try {
    await Registration.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "Deleted" });
  } catch (err) {
    console.error("Delete registration error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
