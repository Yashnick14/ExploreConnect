// src/Components/RegisterModal.jsx
import React, { useEffect, useRef, useState } from "react";
import {
  FiCalendar,
  FiClock,
  FiUser,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import PropTypes from "prop-types";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const RegisterModal = ({
  isOpen,
  open,
  onClose,
  onSubmit,
  initial = {},
  submitLabel = "Register",
}) => {
  const opened = typeof isOpen !== "undefined" ? isOpen : open;

  // ---------- utils ----------
  const parseDDMMYYYY = (str) => {
    if (!str || typeof str !== "string") return null;
    const [dd, mm, yyyy] = str.split("/").map(Number);
    if (!dd || !mm || !yyyy) return null;
    const d = new Date(yyyy, mm - 1, dd);
    return d && d.getMonth() === mm - 1 ? d : null;
  };

  const formatDDMMYYYY = (date) => {
    if (!(date instanceof Date)) return "";
    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const yyyy = date.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  const isSameDay = (a, b) =>
    a instanceof Date &&
    b instanceof Date &&
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  // ---------- state ----------
  const [selectedDate, setSelectedDate] = useState(() =>
    initial.date instanceof Date ? initial.date : parseDDMMYYYY(initial.date)
  );
  const [people, setPeople] = useState(() =>
    Math.max(1, Number(initial.people) || 1)
  );
  const [phoneError, setPhoneError] = useState("");
  const [timeError, setTimeError] = useState("");
  const [peopleError, setPeopleError] = useState("");

  const dpRef = useRef(null);

  // close on ESC
  useEffect(() => {
    if (!opened) return;
    const onEsc = (e) => e.key === "Escape" && onClose?.();
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [opened, onClose]);

  if (!opened) return null;

  const openCalendar = () => dpRef.current?.setOpen(true);

  const today = new Date();
  const startOfToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  const validatePhone = (value) =>
    (value || "").replace(/\D+/g, "").length === 10;

  // “10am” / “2pm” (no spaces)
  const validateTimeDetailed = (value) => {
    const str = (value || "").trim();
    const m = /^(\d{1,2})(am|pm)$/i.exec(str);
    if (!m) return { valid: false, error: "Time format should be like 10am." };
    const hour = Number(m[1]);
    if (hour < 1 || hour > 12)
      return { valid: false, error: "Enter a valid time" };
    return { valid: true };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPhoneError("");
    setTimeError("");
    setPeopleError("");

    const fd = new FormData(e.currentTarget);
    const phone = fd.get("phone");
    const time = fd.get("time");

    let ok = true;

    if (!validatePhone(phone)) {
      setPhoneError("Phone number must be exactly 10 digits.");
      ok = false;
    }

    const t = validateTimeDetailed(time);
    if (!t.valid) {
      setTimeError(t.error);
      ok = false;
    }

    if (!(people >= 1)) {
      setPeopleError("There must be at least 1 person.");
      ok = false;
    }

    if (!ok) return;

    const payload = Object.fromEntries(fd.entries());
    payload.people = Number(people);
    payload.date = selectedDate ? formatDDMMYYYY(selectedDate) : "";

    await onSubmit?.(payload);
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-black/40 backdrop-blur-[1px] flex items-center justify-center px-4">
      <div
        className="bg-white w-full max-w-3xl rounded-xl shadow-xl"
        role="dialog"
        aria-modal="true"
      >
        <form onSubmit={handleSubmit} noValidate>
          <div className="p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Personal Info */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  Personal Information
                </h3>

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

                <div className="mb-1">
                  <input
                    name="phone"
                    defaultValue={initial.phone || ""}
                    placeholder="Phone number (10 digits)"
                    className={`w-full h-10 rounded-md border px-3 text-sm text-gray-800 placeholder-gray-400 ${
                      phoneError ? "border-red-500" : "border-gray-300"
                    }`}
                    inputMode="numeric"
                    pattern="\d{10}"
                    aria-invalid={!!phoneError}
                    aria-describedby="phone-error"
                    required
                  />
                </div>
                {phoneError ? (
                  <p id="phone-error" className="text-xs text-red-600 mt-1">
                    {phoneError}
                  </p>
                ) : null}
              </div>

              {/* Registration Info */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  Registration Information
                </h3>

                {/* Date */}
                <div className="relative mb-3" translate="no">
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
                    translate="no"
                    minDate={new Date()}
                    isClearable
                    showPopperArrow={false}
                    popperPlacement="bottom-start"
                    calendarClassName="custom-cal rounded-xl overflow-hidden shadow-xl border border-gray-200 bg-white"
                    renderCustomHeader={({
                      date,
                      decreaseMonth,
                      increaseMonth,
                      prevMonthButtonDisabled,
                      nextMonthButtonDisabled,
                    }) => (
                      <div className="custom-cal__header-bar">
                        <button
                          type="button"
                          onClick={decreaseMonth}
                          disabled={prevMonthButtonDisabled}
                          className="custom-cal__nav-btn"
                          aria-label="Previous month"
                        >
                          <FiChevronLeft className="text-white" />
                        </button>
                        <div className="text-sm font-semibold">
                          {date.toLocaleString(undefined, {
                            month: "long",
                            year: "numeric",
                          })}
                        </div>
                        <button
                          type="button"
                          onClick={increaseMonth}
                          disabled={nextMonthButtonDisabled}
                          className="custom-cal__nav-btn"
                          aria-label="Next month"
                        >
                          <FiChevronRight className="text-white" />
                        </button>
                      </div>
                    )}
                    disabledKeyboardNavigation
                    dayClassName={(d) => {
                      const base =
                        "w-9 h-9 flex items-center justify-center rounded-md text-[13.5px] md:text-sm font-medium";
                      const selected =
                        selectedDate && isSameDay(d, selectedDate)
                          ? " bg-green-600 text-white"
                          : "";
                      const markToday = isSameDay(d, today)
                        ? " bg-gray-100"
                        : "";
                      const isDisabled = d < startOfToday;
                      const state = isDisabled
                        ? " text-gray-400 cursor-not-allowed"
                        : " text-gray-800 cursor-pointer";
                      return base + selected + markToday + state;
                    }}
                  />
                </div>

                {/* Time */}
                <div className="relative mb-1">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <FiClock className="text-gray-500" />
                  </div>
                  <input
                    type="text"
                    name="time"
                    defaultValue={initial.time || ""}
                    placeholder="Time (e.g., 2pm or 11am — no spaces)"
                    className={`w-full h-10 rounded-md border pl-10 pr-3 text-sm text-gray-800 placeholder-gray-400 ${
                      timeError ? "border-red-500" : "border-gray-300"
                    }`}
                    aria-invalid={!!timeError}
                    aria-describedby="time-error"
                    required
                  />
                </div>
                {timeError ? (
                  <p id="time-error" className="text-xs text-red-600 mt-1">
                    {timeError}
                  </p>
                ) : null}

                {/* People */}
                <div className="mt-3">
                  <h4 className="sr-only">People</h4>
                  <input type="hidden" name="people" value={people} />
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <FiUser className="text-gray-500" />
                      </div>
                      <div
                        className={`pl-10 pr-3 py-2 h-10 rounded-md border flex items-center gap-2 ${
                          peopleError ? "border-red-500" : "border-gray-300"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => setPeople((p) => Math.max(1, p - 1))}
                          aria-label="Decrease people"
                          className="w-8 h-8 rounded-md border border-gray-300 flex items-center justify-center text-gray-700 hover:bg-gray-50"
                        >
                          −
                        </button>
                        <div className="min-w-8 text-center text-sm font-medium text-gray-900">
                          {people}
                        </div>
                        <button
                          type="button"
                          onClick={() => setPeople((p) => p + 1)}
                          aria-label="Increase people"
                          className="w-8 h-8 rounded-md border border-gray-300 flex items-center justify-center text-gray-700 hover:bg-gray-50"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <span className="text-sm text-gray-600">
                      {people === 1 ? "Person" : "People"}
                    </span>
                  </div>
                  {peopleError ? (
                    <p className="text-xs text-red-600 mt-1">{peopleError}</p>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 md:px-8 pb-7 flex items-center gap-4 justify-center">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-md bg-black text-white text-sm font-medium hover:bg-gray-900"
            >
              {submitLabel}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-md border border-gray-300 text-sm font-medium text-gray-800 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

RegisterModal.propTypes = {
  isOpen: PropTypes.bool,
  open: PropTypes.bool,
  onClose: PropTypes.func,
  onSubmit: PropTypes.func,
  initial: PropTypes.object,
  submitLabel: PropTypes.string,
};

export default RegisterModal;
