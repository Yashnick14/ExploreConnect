// src/Components/PlaceModal.jsx
import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { IoCloudUploadOutline } from "react-icons/io5";
import WorkingHoursModal, {
  DEFAULT_WEEKLY,
  makeCompactHours,
} from "./WorkingHoursModal";

const PlaceModal = ({
  isEditMode,
  form,
  setForm,
  handleChange,
  handleImageChange,
  handleSubmit,
  onCancel,
}) => {
  const [hoursOpen, setHoursOpen] = useState(false);

  const [weekly, setWeekly] = useState(() => {
    try {
      if (form?.workingHoursWeekly) {
        const parsed =
          typeof form.workingHoursWeekly === "string"
            ? JSON.parse(form.workingHoursWeekly)
            : form.workingHoursWeekly;
        if (Array.isArray(parsed) && parsed.length === 7) return parsed;
      }
    } catch (err) {
      console.debug("Invalid workingHoursWeekly JSON", err);
    }
    return DEFAULT_WEEKLY;
  });

  // keep local weekly in sync when EDIT injects saved weekly JSON
  useEffect(() => {
    try {
      if (form?.workingHoursWeekly) {
        const parsed =
          typeof form.workingHoursWeekly === "string"
            ? JSON.parse(form.workingHoursWeekly)
            : form.workingHoursWeekly;
        if (Array.isArray(parsed) && parsed.length === 7) setWeekly(parsed);
      }
    } catch (err) {
      console.debug("Invalid workingHoursWeekly JSON", err);
    }
  }, [form?.workingHoursWeekly]);

  useEffect(() => {
    if (!isEditMode && !form.workingHours) {
      setForm((prev) => ({ ...prev, workingHours: "" }));
    }
    // ensure removedIndexes exists for edit sessions
    setForm((prev) => ({ ...prev, removedIndexes: prev.removedIndexes ?? [] }));
  }, [isEditMode, form.workingHours, setForm]);

  const openWeeklyModal = (e) => {
    e.preventDefault();
    setHoursOpen(true);
  };

  const saveWeekly = (val) => {
    setWeekly(val);
    setForm((prev) => ({
      ...prev,
      workingHours: makeCompactHours(val),
      workingHoursWeekly: JSON.stringify(val),
    }));
    setHoursOpen(false);
  };

  // IMPORTANT: record index if the removed image is an existing URL (string)
  const handleRemoveImage = (index) => {
    const current = form.images?.[index];
    const updatedImages = [...(form.images || [])];
    updatedImages[index] = null;

    setForm((prev) => {
      let removed = prev.removedIndexes || [];
      if (typeof current === "string") {
        // avoid duplicates
        if (!removed.includes(index)) removed = [...removed, index];
      }
      return { ...prev, images: updatedImages, removedIndexes: removed };
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/20">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl p-6">
        <h3 className="text-xl font-bold text-center mb-4">
          {isEditMode ? "Edit Place" : "Add New Place"}
        </h3>

        <form onSubmit={handleSubmit}>
          <div className="flex flex-col md:flex-row gap-4">
            {/* Images */}
            <div className="md:w-1/4 grid grid-cols-2 gap-2">
              {[0, 1, 2, 3].map((index) => {
                const image = form.images?.[index];
                let previewUrl = "";
                if (image && typeof image === "string") previewUrl = image;
                else if (image instanceof File)
                  previewUrl = URL.createObjectURL(image);

                return (
                  <div key={index} className="relative">
                    <label
                      htmlFor={`imageUpload${index}`}
                      className="border-2 border-dashed border-gray-300 bg-gray-50 rounded-md flex flex-col items-center justify-center text-center p-2 h-32 cursor-pointer"
                    >
                      {image ? (
                        <img
                          src={previewUrl}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover rounded"
                        />
                      ) : (
                        <>
                          <IoCloudUploadOutline className="text-2xl text-gray-400" />
                          <p className="text-[10px]">
                            {index === 0 ? "Required" : "Optional"}
                          </p>
                        </>
                      )}
                      <input
                        id={`imageUpload${index}`}
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          handleImageChange(index, e.target.files[0])
                        }
                        className="hidden"
                      />
                    </label>

                    {image && (
                      <button
                        type="button"
                        onClick={() => {
                          const count = (form.images || []).filter(
                            (img) => img !== null
                          ).length;
                          if (count > 1) handleRemoveImage(index);
                          else alert("At least one image is required.");
                        }}
                        className={`absolute top-1 right-1 bg-white text-xs px-1 rounded shadow ${
                          (form.images || []).filter((img) => img !== null)
                            .length <= 1
                            ? "text-gray-400 cursor-not-allowed"
                            : "text-red-600"
                        }`}
                        disabled={
                          (form.images || []).filter((img) => img !== null)
                            .length <= 1
                        }
                        aria-label={`Remove image ${index + 1}`}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Fields */}
            <div className="md:w-3/4 grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Place Name"
                className="bg-gray-100 px-3 py-1.5 rounded"
                required
              />

              {/* Working Hours (opens modal) */}
              <div className="relative">
                <input
                  type="text"
                  name="workingHours"
                  value={form.workingHours}
                  onFocus={openWeeklyModal}
                  onClick={openWeeklyModal}
                  readOnly
                  placeholder="Working Hours"
                  className="bg-gray-100 px-3 py-1.5 rounded w-full cursor-pointer"
                  required
                />
                <button
                  type="button"
                  onClick={openWeeklyModal}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-sm underline text-gray-600"
                >
                  Edit weekly hours
                </button>
              </div>

              <input
                type="text"
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="Location"
                className="bg-gray-100 px-3 py-1.5 rounded"
                required
              />

              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Description"
                rows="2"
                className="bg-gray-100 px-3 py-1.5 rounded resize-none"
                required
              />

              <input
                type="text"
                name="district"
                value={form.district}
                onChange={handleChange}
                placeholder="District"
                className="bg-gray-100 px-3 py-1.5 rounded"
                required
              />

              <input
                type="text"
                name="category"
                value={form.category}
                onChange={handleChange}
                placeholder="Category"
                className="bg-gray-100 px-3 py-1.5 rounded"
                required
              />

              {/* Contact number */}
              <input
                type="text"
                name="contactNumber"
                value={form.contactNumber}
                onChange={handleChange}
                placeholder="Contact Number (10 digits)"
                className="bg-gray-100 px-3 py-1.5 rounded"
                required
              />

              {/* Latitude + Longitude */}
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  name="lat"
                  value={form.lat || ""}
                  onChange={handleChange}
                  placeholder="Latitude"
                  className="bg-gray-100 px-3 py-1.5 rounded"
                />
                <input
                  type="text"
                  name="lng"
                  value={form.lng || ""}
                  onChange={handleChange}
                  placeholder="Longitude"
                  className="bg-gray-100 px-3 py-1.5 rounded"
                />
              </div>

              {/* Pets Allowed */}
              <label className="flex items-center gap-2 md:col-start-2">
                <input
                  type="checkbox"
                  name="petsAllowed"
                  checked={form.petsAllowed}
                  onChange={handleChange}
                />
                <span>Pets Allowed</span>
              </label>

              {/* Exclusive Place ✅ */}
              <label className="flex items-center gap-2 md:col-start-2">
                <input
                  type="checkbox"
                  name="exclusive"
                  checked={form.exclusive}
                  onChange={handleChange}
                />
                <span>Exclusive Place</span>
              </label>

              {/* Hidden: weekly JSON */}
              <input
                type="hidden"
                name="workingHoursWeekly"
                value={form.workingHoursWeekly || JSON.stringify(weekly)}
                readOnly
              />

              {/* Hidden: removed indexes */}
              <input
                type="hidden"
                name="removedIndexes"
                value={JSON.stringify(form.removedIndexes || [])}
                readOnly
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-center gap-4 mt-6">
            <button
              type="submit"
              className="bg-black text-white px-6 py-2 rounded"
            >
              {isEditMode ? "Update" : "Add"}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="border px-6 py-2 rounded"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      {hoursOpen && (
        <WorkingHoursModal
          value={weekly}
          onClose={() => setHoursOpen(false)}
          onSave={saveWeekly}
        />
      )}
    </div>
  );
};

/*PropTypes for validation */
PlaceModal.propTypes = {
  isEditMode: PropTypes.bool.isRequired,
  form: PropTypes.shape({
    images: PropTypes.array,
    name: PropTypes.string,
    workingHours: PropTypes.string,
    workingHoursWeekly: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.array,
    ]),
    location: PropTypes.string,
    description: PropTypes.string,
    district: PropTypes.string,
    category: PropTypes.string,
    contactNumber: PropTypes.string,
    lat: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    lng: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    petsAllowed: PropTypes.bool,
    exclusive: PropTypes.bool,
    removedIndexes: PropTypes.array,
  }).isRequired,
  setForm: PropTypes.func.isRequired,
  handleChange: PropTypes.func.isRequired,
  handleImageChange: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default PlaceModal;
