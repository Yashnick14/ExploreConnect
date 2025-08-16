// controllers/registrationController.js
import mongoose from "mongoose";
import Registration from "../models/RegistrationsModel.js";
import RegistrationEditRequest from "../models/RegistrationEditModel.js"; // <-- NEW

// dd/MM/yyyy -> Date
function parseDDMMYYYY(str) {
  if (!str || typeof str !== "string") return null;
  const [dd, mm, yyyy] = str.split("/").map(Number);
  if (!dd || !mm || !yyyy) return null;
  const d = new Date(yyyy, mm - 1, dd);
  if (d.getFullYear() !== yyyy || d.getMonth() !== mm - 1 || d.getDate() !== dd) return null;
  return d;
}

/* ------------------ CREATE ------------------ */
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

    // ---- DUPLICATE CHECK (same user, place & calendar date; pending/approved) ----
    const emailLower = String(email).toLowerCase();
    // Use a day range to be robust to any stored time component
    const startOfDay = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
    const endOfDay = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate() + 1);

    const existing = await Registration.findOne({
      place: placeId,
      email: emailLower,
      status: { $in: ["pending", "approved"] },
      date: { $gte: startOfDay, $lt: endOfDay },
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: `You already have a ${existing.status} registration for this place on this date.`,
      });
    }
    // ---------------------------------------------------------------------------

    const reg = await Registration.create({
      place: placeId,
      name,
      email: emailLower,
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

/* ------------------ LIST ------------------ */
export const listRegistrations = async (req, res) => {
  try {
    const { place, email } = req.query;
    const filter = {};

    if (place && mongoose.Types.ObjectId.isValid(place)) {
      filter.place = place;
    }
    if (email) {
      filter.email = String(email).toLowerCase();
    }

    const regs = await Registration.find(filter)
      .sort({ createdAt: -1 })
      .populate("place", "name district");

    // attach pending edit info
    const ids = regs.map((r) => r._id);
    const pending = await RegistrationEditRequest.find({
      registration: { $in: ids },
      status: "pending",
    }).lean();

    const byReg = new Map(pending.map((p) => [String(p.registration), p]));
    const out = regs.map((r) => {
      const obj = r.toObject();
      obj.pendingEdit = byReg.get(String(r._id)) || null;
      return obj;
    });

    res.status(200).json({ success: true, data: out });
  } catch (err) {
    console.error("List registrations error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ------------------ READ ONE ------------------ */
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

/* ------------------ UPDATE (ADMIN/USER) ------------------ */
export const updateRegistration = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(400).json({ success: false, message: "Invalid ID" });

  try {
    const allowed = ["status", "name", "email", "phone", "date", "time", "people", "place"];
    const patch = {};
    for (const k of allowed) {
      if (typeof req.body[k] !== "undefined") patch[k] = req.body[k];
    }

    if (patch.status && !["pending", "approved", "completed", "cancelled"].includes(patch.status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    if (typeof patch.date === "string") {
      const d = parseDDMMYYYY(patch.date);
      if (!d) return res.status(400).json({ success: false, message: "Date must be DD/MM/YYYY" });
      patch.date = d;
    }

    if (typeof patch.people !== "undefined") patch.people = Number(patch.people || 1);

    const updated = await Registration.findByIdAndUpdate(id, patch, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: "Not found" });

    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    console.error("Update registration error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ------------------ DELETE ------------------ */
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

/* ---------- USER: create edit request (pending) ---------- */
export const createEditRequest = async (req, res) => {
  try {
    const { id } = req.params; // registration id
    const { email, phone, time, people, date, status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid registration id" });
    }
    if (!email) {
      return res.status(400).json({ success: false, message: "Missing email" });
    }

    const reg = await Registration.findById(id);
    if (!reg) return res.status(404).json({ success: false, message: "Registration not found" });
    if (String(reg.email).toLowerCase() !== String(email).toLowerCase()) {
      return res.status(403).json({ success: false, message: "Not allowed to edit this registration" });
    }

    // prevent duplicate pending request
    const existing = await RegistrationEditRequest.findOne({ registration: reg._id, status: "pending" });
    if (existing) {
      return res.status(409).json({ success: false, message: "There is already a pending edit request for this registration" });
    }

    const safeStatus = typeof status === "string" ? status.toLowerCase() : undefined;
    const patch = {
      phone: typeof phone !== "undefined" ? phone : reg.phone,
      time: typeof time !== "undefined" ? time : reg.time,
      people: typeof people !== "undefined" ? Number(people) : reg.people,
      date: date || null, // keep dd/MM/yyyy (convert on approve)
    };

    // Only allow specific statuses through edit-requests
    if (safeStatus && ["pending", "approved", "completed", "cancelled"].includes(safeStatus)) {
      patch.status = safeStatus;
    }

    const request = await RegistrationEditRequest.create({
      registration: reg._id,
      userEmail: String(email).toLowerCase(),
      patch,
    });

    // Optional: email/notify admin here
    console.log("[ADMIN NOTICE] New registration edit request:", {
      id: request._id,
      registration: String(reg._id),
      patch: request.patch,
    });

    return res.status(201).json({ success: true, data: request });
  } catch (err) {
    console.error("createEditRequest error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ---------- ADMIN/USER: list edit requests ---------- */
export const listEditRequests = async (req, res) => {
  try {
    const { status, email } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (email) filter.userEmail = String(email).toLowerCase();

    const rows = await RegistrationEditRequest.find(filter)
      .sort({ createdAt: -1 })
      .populate({ path: "registration", select: "place name email phone date time people status" });

    return res.status(200).json({ success: true, data: rows });
  } catch (err) {
    console.error("listEditRequests error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ---------- ADMIN: approve/reject ---------- */
export const actOnEditRequest = async (req, res) => {
  try {
    const { rid } = req.params; // request id
    const { action, adminNote } = req.body;

    const reqDoc = await RegistrationEditRequest.findById(rid);
    if (!reqDoc) return res.status(404).json({ success: false, message: "Request not found" });
    if (reqDoc.status !== "pending") return res.status(400).json({ success: false, message: "Already resolved" });

    if (action === "reject") {
      reqDoc.status = "rejected";
      reqDoc.adminNote = adminNote || "";
      await reqDoc.save();
      return res.status(200).json({ success: true, data: reqDoc });
    }

    if (action === "approve") {
      const reg = await Registration.findById(reqDoc.registration);
      if (!reg) return res.status(404).json({ success: false, message: "Original registration not found" });

      const patch = reqDoc.patch || {};

      // Apply patch fields
      if (typeof patch.people !== "undefined") reg.people = Number(patch.people || 1);
      if (typeof patch.phone !== "undefined") reg.phone = patch.phone;
      if (typeof patch.time !== "undefined") reg.time = patch.time;
      if (typeof patch.date !== "undefined" && patch.date) {
        const d = parseDDMMYYYY(patch.date);
        if (!d) return res.status(400).json({ success: false, message: "Invalid date format in request" });
        reg.date = d;
      }
      if (typeof patch.status === "string" && ["pending", "approved", "completed", "cancelled"].includes(patch.status)) {
        reg.status = patch.status;
      }

      await reg.save();

      reqDoc.status = "approved";
      reqDoc.adminNote = adminNote || "";
      reqDoc.appliedAt = new Date();
      await reqDoc.save();

      return res.status(200).json({ success: true, data: reqDoc });
    }

    return res.status(400).json({ success: false, message: "Unknown action" });
  } catch (err) {
    console.error("actOnEditRequest error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
