import React from "react";
import { IoCloudUploadOutline } from "react-icons/io5";

const PlaceModal = ({
  isEditMode,
  form,
  setForm,
  handleChange,
  handleImageChange,
  handleSubmit,
  onCancel,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/20">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl p-6">
        <h3 className="text-xl font-bold text-center mb-4">
          {isEditMode ? "Edit Place" : "Add New Place"}
        </h3>
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col md:flex-row gap-4">
            {/* Image Upload Box */}
            <div className="md:w-1/4 grid grid-cols-2 gap-2">
              {[0, 1, 2, 3].map((index) => (
                <label
                  key={index}
                  htmlFor={`imageUpload${index}`}
                  className="border-2 border-dashed border-gray-300 bg-gray-50 rounded-md flex flex-col items-center justify-center text-center p-2 h-32 cursor-pointer"
                >
                  {form.images[index] ? (
                    <img
                      src={
                        typeof form.images[index] === "string"
                          ? form.images[index]
                          : URL.createObjectURL(form.images[index])
                      }
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover rounded"
                    />
                  ) : (
                    <>
                      <IoCloudUploadOutline className="text-2xl text-gray-400" />
                      <p className="text-[10px]">{index === 0 ? "Required" : "Optional"}</p>
                    </>
                  )}
                  <input
                    id={`imageUpload${index}`}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageChange(index, e.target.files[0])}
                    className="hidden"
                  />
                </label>
              ))}
            </div>

            {/* Form Fields */}
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
              <input
                type="text"
                name="workingHours"
                value={form.workingHours}
                onChange={handleChange}
                placeholder="Working Hours"
                className="bg-gray-100 px-3 py-1.5 rounded"
                required
              />
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
                name="contactNumber"
                value={form.contactNumber}
                onChange={handleChange}
                placeholder="Contact Number"
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
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="petsAllowed"
                  checked={form.petsAllowed}
                  onChange={handleChange}
                />
                <span>Pets Allowed</span>
              </label>
            </div>
          </div>

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
    </div>
  );
};

export default PlaceModal;
