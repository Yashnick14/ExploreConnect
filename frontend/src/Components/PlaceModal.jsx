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
  const handleRemoveImage = (index) => {
    const updatedImages = [...form.images];
    updatedImages[index] = null;
    setForm({ ...form, images: updatedImages });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/20">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl p-6">
        <h3 className="text-xl font-bold text-center mb-4">
          {isEditMode ? "Edit Place" : "Add New Place"}
        </h3>
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col md:flex-row gap-4">
            {/* Image Upload Section */}
            <div className="md:w-1/4 grid grid-cols-2 gap-2">
              {[0, 1, 2, 3].map((index) => {
                const image = form.images?.[index];
                let previewUrl = "";
                if (image && typeof image === "string") {
                  previewUrl = image;
                } else if (image instanceof File) {
                  previewUrl = URL.createObjectURL(image);
                }
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
                          const current =
                            form.images.filter((img) => img !== null);
                          if (current.length > 1) handleRemoveImage(index);
                          else alert("At least one image is required.");
                        }}
                        className={`absolute top-1 right-1 bg-white text-xs px-1 rounded shadow ${
                          form.images.filter((img) => img !== null).length <= 1
                            ? "text-gray-400 cursor-not-allowed"
                            : "text-red-600"
                        }`}
                        disabled={
                          form.images.filter((img) => img !== null).length <= 1
                        }
                      >
                        ✕
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Input Fields */}
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
                placeholder="Working Hours (e.g. 9am-5pm)"
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
                name="category"
                value={form.category}
                onChange={handleChange}
                placeholder="Category"
                className="bg-gray-100 px-3 py-1.5 rounded"
                required
              />
              <input
                type="text"
                name="contactNumber"
                value={form.contactNumber}
                onChange={handleChange}
                placeholder="Contact Number (10 digits)"
                className="bg-gray-100 px-3 py-1.5 rounded"
                required
              />
              <input
                type="text"
                name="lat"
                value={form.lat}
                onChange={handleChange}
                placeholder="Latitude (e.g. 37.7749)"
                className="bg-gray-100 px-3 py-1.5 rounded"
                required
              />
              <input
                type="text"
                name="lng"
                value={form.lng}
                onChange={handleChange}
                placeholder="Longitude (e.g. -122.4194)"
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
    </div>
  );
};

export default PlaceModal;
