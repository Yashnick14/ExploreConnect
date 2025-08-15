// src/Components/RegisterModal.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { FiCalendar, FiClock, FiUser } from "react-icons/fi";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

/**
 * Props:
 *  - isOpen | open: boolean
 *  - onClose: () => void
 *  - onSubmit: (payload) => void | Promise<void>
 *  - initial?: { name, email, phone, date (dd/MM/yyyy or Date), time, people }
 */
const RegisterModal = ({ isOpen, open, onClose, onSubmit, initial = {} }) => {
  const opened = typeof isOpen !== "undefined" ? isOpen : open; // support both

  // --- helpers ---
  const parseDDMMYYYY = (str) => {
    if (!str || typeof str !== "string") return null;
    const [dd, mm, yyyy] = str.split("/").map(Number);
    if (!dd || !mm || !yyyy) return null;
    const d = new Date(yyyy, mm - 1, dd);
    // quick validity check
    return d && d.getMonth() === mm - 1 ? d : null;
  };
  const formatDDMMYYYY = (date) => {
    if (!(date instanceof Date)) return "";
    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const yyyy = date.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
    };

  // --- local state ---
  const [selectedDate, setSelectedDate] = useState(() => {
    if (initial.date instanceof Date) return initial.date;
    return parseDDMMYYYY(initial.date) || null;
  });

  // focus/escape handling
  useEffect(() => {
    if (!opened) return;
    const onEsc = (e) => e.key === "Escape" && onClose?.();
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [opened, onClose]);

  if (!opened) return null;

  // datepicker control (open on icon click)
  const dpRef = useRef(null);
  const openCalendar = () => dpRef.current?.setOpen(true);

  const handleSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = Object.fromEntries(fd.entries());
    payload.people = Number(payload.people || 1);
    payload.date = selectedDate ? formatDDMMYYYY(selectedDate) : ""; // send formatted date
    onSubmit?.(payload);
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-black/40 backdrop-blur-[1px] flex items-center justify-center px-4">
      <div className="bg-white w-full max-w-3xl rounded-xl shadow-xl" role="dialog" aria-modal="true">
        <form onSubmit={handleSubmit}>
          {/* body */}
          <div className="p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Personal Info */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Personal Information</h3>

                <input
                  name="name"
                  defaultValue={initial.name || ""}
                  placeholder="Name"
                  className="w-full h-10 rounded-md border border-gray-300 px-3 text-sm text-gray-800 placeholder-gray-400 mb-3"
                  required
                  readOnly
                />
                <input
                  type="email"
                  name="email"
                  defaultValue={initial.email || ""}
                  placeholder="Email"
                  className="w-full h-10 rounded-md border border-gray-300 px-3 text-sm text-gray-800 placeholder-gray-400 mb-3"
                  required
                  readOnly
                />
                <input
                  name="phone"
                  defaultValue={initial.phone || ""}
                  placeholder="Phone number"
                  className="w-full h-10 rounded-md border border-gray-300 px-3 text-sm text-gray-800 placeholder-gray-400"
                  required
                />
              </div>

              {/* Registration Info */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Registration Information</h3>

                {/* Date (react-datepicker) */}
                <div className="relative mb-3">
                  <button
                    type="button"
                    onClick={openCalendar}
                    className="absolute left-3 top-1/2 -translate-y-1/2"
                    aria-label="Open calendar"
                  >
                    <FiCalendar className="text-gray-500" />
                  </button>

                  <DatePicker
                    ref={dpRef}
                    selected={selectedDate}
                    onChange={(date) => setSelectedDate(date)}
                    placeholderText="DD/MM/YYYY"
                    dateFormat="dd/MM/yyyy"
                    className="w-full h-10 rounded-md border border-gray-300 pl-10 pr-3 text-sm text-gray-800 placeholder-gray-400"
                    minDate={new Date()} // optional: prevent past dates
                    isClearable
                    showPopperArrow={false}
                    popperPlacement="bottom-start"
                  />
                </div>

                {/* Time (keep simple text, or swap to a time picker if you want) */}
                <div className="relative mb-3">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <FiClock className="text-gray-500" />
                  </div>
                  <input
                    type="text"
                    name="time"
                    defaultValue={initial.time || ""}
                    placeholder="Time (e.g., 10:00 AM)"
                    className="w-full h-10 rounded-md border border-gray-300 pl-10 pr-3 text-sm text-gray-800 placeholder-gray-400"
                    required
                  />
                </div>

                {/* People */}
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <FiUser className="text-gray-500" />
                  </div>
                  <select
                    name="people"
                    defaultValue={initial.people || 1}
                    className="w-full h-10 rounded-md border border-gray-300 pl-10 pr-8 text-sm text-gray-800 bg-white"
                  >
                    {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n}>
                        {n} {n === 1 ? "Person" : "People"}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* footer */}
          <div className="px-6 md:px-8 pb-7 flex items-center gap-4 justify-center">
            <button type="submit" className="px-6 py-2.5 rounded-md bg-black text-white text-sm font-medium hover:bg-gray-900">
              Register
            </button>
            <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-md border border-gray-300 text-sm font-medium text-gray-800 hover:bg-gray-50">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterModal;
