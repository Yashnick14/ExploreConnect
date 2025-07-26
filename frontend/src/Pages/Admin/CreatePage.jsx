import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePlaceStore } from "@/store/Place/place";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../css/CreatePage.css";

const CreatePage = () => {
  const navigate = useNavigate();
  const { createPlace } = usePlaceStore();

  const [form, setForm] = useState({
    name: "",
    description: "",
    location: "",
    district: "",
    image: "",
    category: "",
    contactNumber: "",
    workingHours: "",
    petsAllowed: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prevForm) => ({
      ...prevForm,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { success, message } = await createPlace(form);
    if (success) {
      toast.success("Place created successfully!", {
        position: "top-right",
        autoClose: 3000,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      setTimeout(() => navigate("/"), 3000);
    } else {
      toast.error(message || "Failed to create place.", {
        position: "top-right",
        autoClose: 3000,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  return (
    <div className="create-container">
      <ToastContainer />
      <h2>Add a New Place</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="location"
          placeholder="Location"
          value={form.location}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="district"
          placeholder="District"
          value={form.district}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="image"
          placeholder="Image URL"
          value={form.image}
          onChange={handleChange}
          required
        />
        <textarea
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="category"
          placeholder="Category (e.g., Beach, Park)"
          value={form.category}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="contactNumber"
          placeholder="Contact Number"
          value={form.contactNumber}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="workingHours"
          placeholder="Working Hours (e.g., 9AM - 6PM)"
          value={form.workingHours}
          onChange={handleChange}
          required
        />

        <label className="checkbox-label">
          <input
            type="checkbox"
            name="petsAllowed"
            checked={form.petsAllowed}
            onChange={handleChange}
          />
          Pets Allowed
        </label>

        <button className="submit-button" type="submit">Create</button>
      </form>
    </div>
  );
};

export default CreatePage;
