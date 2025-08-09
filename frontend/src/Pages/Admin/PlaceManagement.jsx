import React, { useEffect, useState } from "react";
import { usePlaceStore } from "../../store/Place/place";
import Sidebar from "../../Components/Sidebar";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FiMenu } from "react-icons/fi";
import PlaceModal from "../../Components/PlaceModal";

// exactly your UserManagement delete modal
const DeleteConfirmModal = ({ onCancel, onConfirm }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/30">
    <div className="flex flex-col items-center bg-white shadow-md rounded-xl py-6 px-5 md:w-[460px] w-[370px] border border-gray-200">
      <div className="flex items-center justify-center p-4 bg-red-100 rounded-full">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M2.875 5.75h1.917m0 0h15.333m-15.333 0v13.417a1.917 1.917 0 0 0 1.916 1.916h9.584a1.917 1.917 0 0 0 1.916-1.916V5.75m-10.541 0V3.833a1.917 1.917 0 0 1 1.916-1.916h3.834a1.917 1.917 0 0 1 1.916 1.916V5.75m-5.75 4.792v5.75m3.834-5.75v5.75"
            stroke="#DC2626"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <h2 className="text-gray-900 font-semibold mt-4 text-xl">Are you sure?</h2>
      <p className="text-sm text-gray-600 mt-2 text-center">
        Do you really want to continue? This action<br/>cannot be undone.
      </p>
      <div className="flex items-center justify-center gap-4 mt-5 w-full">
        <button
          type="button"
          onClick={onCancel}
          className="w-full md:w-36 h-10 rounded-md border border-gray-300 bg-white text-gray-600 font-medium text-sm hover:bg-gray-100 active:scale-95 transition"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="w-full md:w-36 h-10 rounded-md text-white bg-red-600 font-medium text-sm hover:bg-red-700 active:scale-95 transition"
        >
          Confirm
        </button>
      </div>
    </div>
  </div>
);

const PlaceManagement = () => {
  const { places, fetchPlaces, createPlace, updatePlace, deletePlace } =
    usePlaceStore();
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingPlace, setEditingPlace] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedPlaceId, setSelectedPlaceId] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const defaultForm = {
    name: "",
    description: "",
    location: "",
    district: "",
    images: [],
    category: "",
    contactNumber: "",
    workingHours: "",
    petsAllowed: false,
    lat: "",
    lng: "",
  };
  const [form, setForm] = useState(defaultForm);

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
    const imgs = [...form.images];
    imgs[index] = file;
    setForm((prev) => ({ ...prev, images: imgs }));
  };

  const handleEdit = () => {
    const p = places.find((x) => x._id === selectedPlaceId);
    if (!p) return;

    const paddedImages = [
      ...p.images.map((img) => `${import.meta.env.VITE_API_BASE_URL}/uploads/${img}`),
    ];
    while (paddedImages.length < 4) paddedImages.push(null);

    setForm({
      name: p.name,
      description: p.description,
      location: p.location,
      district: p.district,
      images: paddedImages,
      category: p.category,
      contactNumber: p.contactNumber,
      workingHours: p.workingHours,
      petsAllowed: p.petsAllowed,
      lat: p.lat?.toString() || "",
      lng: p.lng?.toString() || "",
    });

    setEditingPlace(p._id);
    setIsEditMode(true);
    setShowModal(true);
  };

  const handleDeleteClick = () => {
    if (!selectedPlaceId) return;
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedPlaceId) return;
    const { success, message } = await deletePlace(selectedPlaceId);
    if (success) {
      toast.success("Place deleted successfully");
      fetchPlaces();
      setSelectedPlaceId(null);
    } else {
      toast.error(message || "Failed to delete place.");
    }
    setShowDeleteModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // validations
    const hoursRe = /^([1-9]|1[0-2])([ap]m)-([1-9]|1[0-2])([ap]m)$/i;
    const phoneRe = /^\d{10}$/;
    if (!hoursRe.test(form.workingHours)) {
      toast.error("Working hours must be in format like 9am-5pm");
      return;
    }
    if (!phoneRe.test(form.contactNumber)) {
      toast.error("Contact number must be 10 digits");
      return;
    }
    // optionally validate lat/lng are numeric
    if (isNaN(parseFloat(form.lat)) || isNaN(parseFloat(form.lng))) {
      toast.error("Latitude and Longitude must be valid numbers");
      return;
    }

    const action = isEditMode
      ? updatePlace(editingPlace, form)
      : createPlace(form);
    const { success, message } = await action;

    if (success) {
      toast.success(isEditMode ? "Place updated successfully" : "Place added successfully");
      fetchPlaces();
      setShowModal(false);
      setForm(defaultForm);
      setIsEditMode(false);
      setEditingPlace(null);
      setSelectedPlaceId(null);
    } else {
      toast.error(message || "Action failed");
    }
  };

  const handleCancel = () => {
    setShowModal(false);
    setForm(defaultForm);
    setIsEditMode(false);
    setEditingPlace(null);
    setSelectedPlaceId(null);
    fetchPlaces();
  };

  return (
    <div className="flex min-h-screen bg-gray-100 overflow-x-hidden relative">
      {/* Mobile Toggle */}
      <div className="fixed top-4 left-4 z-50 md:hidden">
        <button
          onClick={() => setIsSidebarOpen((o) => !o)}
          className="text-black bg-white shadow rounded px-3 py-2"
        >
          <FiMenu />
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 z-40 h-full bg-white md:static md:block ${
          isSidebarOpen ? "block" : "hidden"
        }`}
      >
        <Sidebar />
      </div>

      {/* Main */}
      <div className="flex-1 md:ml-64 p-4 w-full">
        <ToastContainer />

        {/* Top Bar */}
        <div className="flex justify-between items-center mb-4 flex-wrap gap-4 sm:flex-nowrap">
          <h2 className="text-2xl font-bold w-full text-center md:text-left md:w-auto">
            Manage Places
          </h2>
          <div className="flex flex-col sm:flex-row w-full sm:w-auto space-y-2 sm:space-y-0 sm:space-x-2">
            <button className="bg-black text-white px-4 py-2 rounded w-full sm:w-auto">
              All
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded w-full sm:w-auto"
            >
              ADD
            </button>
            <button
              onClick={handleEdit}
              disabled={!selectedPlaceId}
              className={`px-4 py-2 rounded text-white w-full sm:w-auto ${
                !selectedPlaceId
                  ? "bg-gray-400"
                  : "bg-black hover:bg-gray-800"
              }`}
            >
              EDIT
            </button>
            <button
              onClick={handleDeleteClick}
              disabled={!selectedPlaceId}
              className={`px-4 py-2 rounded text-white w-full sm:w-auto ${
                !selectedPlaceId
                  ? "bg-gray-400"
                  : "bg-red-600 hover:bg-red-700"
              }`}
            >
              DELETE
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="mt-6 bg-white shadow rounded overflow-x-auto">
          <table className="min-w-[800px] w-full border-separate border-spacing-y-3">
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
                <tr>
                  <td colSpan="7" className="text-center py-6 text-gray-500">
                    No places available.
                  </td>
                </tr>
              ) : (
                places.map((p, i) => (
                  <tr
                    key={p._id}
                    className="bg-white shadow-sm hover:shadow-md"
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedPlaceId === p._id}
                        onChange={() =>
                          setSelectedPlaceId((s) =>
                            s === p._id ? null : p._id
                          )
                        }
                        className="h-4 w-4 text-blue-600"
                      />
                    </td>
                    <td className="px-4 py-3">{i + 1}</td>
                    <td className="px-4 py-3">{p.name}</td>
                    <td className="px-4 py-3">{p.district}</td>
                    <td className="px-4 py-3">{p.category}</td>
                    <td className="px-4 py-3">{p.workingHours}</td>
                    <td className="px-4 py-3">
                      {p.petsAllowed ? (
                        <span className="text-green-600">Yes</span>
                      ) : (
                        <span className="text-red-600">No</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Add/Edit Modal */}
        {showModal && (
          <PlaceModal
            isEditMode={isEditMode}
            form={form}
            setForm={setForm}
            handleChange={handleChange}
            handleImageChange={handleImageChange}
            handleSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        )}

        {/* Delete Confirmation */}
        {showDeleteModal && (
          <DeleteConfirmModal
            onCancel={() => setShowDeleteModal(false)}
            onConfirm={confirmDelete}
          />
        )}
      </div>
    </div>
  );
};

export default PlaceManagement;
