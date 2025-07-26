import React, { useEffect, useState } from "react";
import { usePlaceStore } from "../../store/Place/place";
import Sidebar from "../../Components/Sidebar";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { IoCloudUploadOutline } from "react-icons/io5";

const PlaceManagement = () => {
  const { places, fetchPlaces, createPlace, updatePlace, deletePlace } = usePlaceStore();
  const [showModal, setShowModal] = useState(false);
  const [editingPlace, setEditingPlace] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedPlaceId, setSelectedPlaceId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    location: "",
    district: "",
    images: [],
    category: "",
    contactNumber: "",
    workingHours: "",
    petsAllowed: false,
  });

  useEffect(() => {
    fetchPlaces();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageChange = (index, file) => {
    if (!file) return;
    const updatedImages = [...form.images];
    updatedImages[index] = file;
    setForm((prev) => ({ ...prev, images: updatedImages }));
  };

  const handleEdit = () => {
    const place = places.find((p) => p._id === selectedPlaceId);
    if (!place) return;

    setForm({
      name: place.name,
      description: place.description,
      location: place.location,
      district: place.district,
      images: place.images.map(img => `${import.meta.env.VITE_API_BASE_URL}/uploads/${img}`),
      category: place.category,
      contactNumber: place.contactNumber,
      workingHours: place.workingHours,
      petsAllowed: place.petsAllowed,
    });

    setEditingPlace(place._id);
    setIsEditMode(true);
    setShowModal(true);
  };

  const handleDelete = async () => {
    if (!selectedPlaceId) return;
    if (window.confirm("Are you sure you want to delete this place?")) {
      const { success, message } = await deletePlace(selectedPlaceId);
      if (success) {
        toast.success("Place deleted successfully");
        fetchPlaces();
        setSelectedPlaceId(null);
      } else {
        toast.error(message || "Failed to delete place.");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();

    // Append form fields
    for (const key in form) {
      if (key !== "images") {
        formData.append(key, form[key]);
      }
    }

    // Handle image array (mix of URLs & new files)
    const imageFiles = form.images.filter(img => img instanceof File);
    imageFiles.forEach((file) => {
      formData.append("images", file);
    });

    let response;
    if (isEditMode) {
      response = await updatePlace(editingPlace, formData, true); // true = isFormData
    } else {
      response = await createPlace(form);
    }

    if (response.success) {
      toast.success(isEditMode ? "Place updated successfully" : "Place added successfully");
      fetchPlaces();
      setShowModal(false);
      setForm({
        name: "",
        description: "",
        location: "",
        district: "",
        images: [],
        category: "",
        contactNumber: "",
        workingHours: "",
        petsAllowed: false,
      });
      setIsEditMode(false);
      setEditingPlace(null);
    } else {
      toast.error(response.message || "Action failed");
    }
  };

  return (
    <div className="flex">
      <Sidebar />
      <ToastContainer />
      <div className="ml-64 w-full p-6 bg-gray-100 min-h-screen">
        {/* Top Bar */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Manage Places</h2>
          <div className="space-x-2">
            <button className="bg-black text-white px-4 py-2 rounded">All</button>
            <button onClick={() => setShowModal(true)} className="bg-green-600 text-white px-4 py-2 rounded">ADD</button>
            <button onClick={handleEdit} disabled={!selectedPlaceId} className={`px-4 py-2 rounded text-white ${!selectedPlaceId ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}>EDIT</button>
            <button onClick={handleDelete} disabled={!selectedPlaceId} className={`px-4 py-2 rounded text-white ${!selectedPlaceId ? 'bg-gray-400' : 'bg-red-600 hover:bg-red-700'}`}>DELETE</button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded shadow bg-white mt-6">
          <table className="min-w-full border-separate border-spacing-y-3">
            <thead className="bg-[#D5F5E3] text-gray-700 text-sm">
              <tr>
                <th className="px-4 py-3 text-left">Select</th>
                <th className="px-4 py-3 text-left">ID</th>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">District</th>
                <th className="px-4 py-3 text-left">Category</th>
                <th className="px-4 py-3 text-left">Hours</th>
                <th className="px-4 py-3 text-left">Pets</th>
              </tr>
            </thead>
            <tbody>
              {places.length === 0 ? (
                <tr><td colSpan="7" className="text-center py-6 text-gray-500">No places available.</td></tr>
              ) : (
                places.map((place, index) => (
                  <tr key={place._id} className="bg-white shadow-sm hover:shadow-md">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedPlaceId === place._id}
                        onChange={() => setSelectedPlaceId(place._id)}
                        className="h-4 w-4 text-blue-600"
                      />
                    </td>
                    <td className="px-4 py-3">{index + 1}</td>
                    <td className="px-4 py-3">{place.name}</td>
                    <td className="px-4 py-3">{place.district}</td>
                    <td className="px-4 py-3">{place.category}</td>
                    <td className="px-4 py-3">{place.workingHours}</td>
                    <td className="px-4 py-3">{place.petsAllowed ? <span className="text-green-600">Yes</span> : <span className="text-red-600">No</span>}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/20">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl p-6">
              <h3 className="text-xl font-bold text-center mb-4">{isEditMode ? "Edit Place" : "Add New Place"}</h3>
              <form onSubmit={handleSubmit}>
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Image Upload Box */}
                  <div className="md:w-1/4 grid grid-cols-2 gap-2">
                    {[0, 1, 2, 3].map((index) => (
                      <label
                        key={index}
                        htmlFor={`imageUpload${index}`}
                        className="border-2 border-dashed bg-gray-50 rounded-md flex flex-col items-center justify-center text-center p-2 h-32 cursor-pointer"
                      >
                        {form.images[index] ? (
                          <img
                            src={typeof form.images[index] === "string" ? form.images[index] : URL.createObjectURL(form.images[index])}
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
                    <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="Place Name" className="bg-gray-100 px-3 py-1.5 rounded" required />
                    <input type="text" name="workingHours" value={form.workingHours} onChange={handleChange} placeholder="Working Hours" className="bg-gray-100 px-3 py-1.5 rounded" required />
                    <input type="text" name="location" value={form.location} onChange={handleChange} placeholder="Location" className="bg-gray-100 px-3 py-1.5 rounded" required />
                    <textarea name="description" value={form.description} onChange={handleChange} placeholder="Description" rows="2" className="bg-gray-100 px-3 py-1.5 rounded resize-none" required />
                    <input type="text" name="district" value={form.district} onChange={handleChange} placeholder="District" className="bg-gray-100 px-3 py-1.5 rounded" required />
                    <input type="text" name="contactNumber" value={form.contactNumber} onChange={handleChange} placeholder="Contact Number" className="bg-gray-100 px-3 py-1.5 rounded" required />
                    <input type="text" name="category" value={form.category} onChange={handleChange} placeholder="Category" className="bg-gray-100 px-3 py-1.5 rounded" required />
                    <label className="flex items-center gap-2">
                      <input type="checkbox" name="petsAllowed" checked={form.petsAllowed} onChange={handleChange} />
                      <span>Pets Allowed</span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-center gap-4 mt-6">
                  <button type="submit" className="bg-black text-white px-6 py-2 rounded">{isEditMode ? "Update" : "Add"}</button>
                  <button type="button" onClick={() => { setShowModal(false); setIsEditMode(false); setEditingPlace(null); }} className="border px-6 py-2 rounded">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlaceManagement;
