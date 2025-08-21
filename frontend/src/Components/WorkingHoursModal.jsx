// src/Components/WorkingHoursModal.jsx
import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { FiChevronUp, FiChevronDown } from "react-icons/fi";

/* Public exports so PlaceModal can reuse */
export const DEFAULT_WEEKLY = [
  { key: "Sun", label: "Sunday", isOpen: false, open: "09:00", close: "17:00" },
  { key: "Mon", label: "Monday", isOpen: true, open: "09:00", close: "17:00" },
  { key: "Tue", label: "Tuesday", isOpen: true, open: "09:00", close: "17:00" },
  {
    key: "Wed",
    label: "Wednesday",
    isOpen: true,
    open: "09:00",
    close: "17:00",
  },
  {
    key: "Thu",
    label: "Thursday",
    isOpen: true,
    open: "09:00",
    close: "17:00",
  },
  { key: "Fri", label: "Friday", isOpen: true, open: "09:00", close: "17:00" },
  {
    key: "Sat",
    label: "Saturday",
    isOpen: false,
    open: "09:00",
    close: "17:00",
  },
];

/* Util the parent can use to produce the compact string your backend expects (e.g. "9am-5pm") */
export const makeCompactHours = (weekly) => {
  if (!Array.isArray(weekly) || weekly.length !== 7) return "";
  const mon = weekly.find((d) => d.key === "Mon");
  const src = mon?.isOpen ? mon : weekly.find((d) => d.isOpen);
  if (!src) return "Closed";

  const to12hNoMinutes = (hhmm) => {
    let [hh] = hhmm.split(":").map(Number);
    const am = hh < 12;
    let h12 = hh % 12 || 12;
    return `${h12}${am ? "am" : "pm"}`;
  };

  return `${to12hNoMinutes(src.open)}-${to12hNoMinutes(src.close)}`;
};

/* ---------- internals ---------- */
const partsFrom24 = (hhmm) => {
  let [h, m] = (hhmm || "09:00").split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 || 12;
  return { hour12, minute: m, ampm };
};
const partsTo24 = ({ hour12, minute, ampm }) => {
  let h = hour12 % 12;
  if (ampm === "PM") h += 12;
  if (ampm === "AM" && hour12 === 12) h = 0;
  return `${String(h).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
};

/* Compact spinner with vertical arrows — gray border + gray chevrons */
const StepperTime = ({ value, onChange, disabled }) => {
  const [parts, setParts] = useState(partsFrom24(value));
  useEffect(() => {
    if (value) setParts(partsFrom24(value));
  }, [value]);

  const commit = (p) => {
    setParts(p);
    onChange && onChange(partsTo24(p));
  };

  const bumpHour = (dir) => {
    let { hour12, minute, ampm } = parts;
    if (dir === 1) {
      if (hour12 === 11) {
        hour12 = 12;
        ampm = ampm === "AM" ? "PM" : "AM";
      } else if (hour12 === 12) hour12 = 1;
      else hour12 += 1;
    } else {
      if (hour12 === 12) {
        hour12 = 11;
        ampm = ampm === "AM" ? "PM" : "AM";
      } else if (hour12 === 1) hour12 = 12;
      else hour12 -= 1;
    }
    commit({ hour12, minute, ampm });
  };

  const bumpMinute = (dir) => {
    let { hour12, minute, ampm } = parts;
    let m = minute + dir * 5;
    if (m >= 60) {
      m -= 60;
      bumpHour(1);
      return;
    }
    if (m < 0) {
      m += 60;
      bumpHour(-1);
      return;
    }
    commit({ hour12, minute: m, ampm });
  };

  return (
    <div
      className={`min-w-[10.5rem] h-10 border border-gray-300 rounded-md px-2 flex items-center gap-2 ${
        disabled ? "bg-gray-100 opacity-70" : "bg-white"
      }`}
    >
      {/* hour */}
      <div className="flex items-center">
        <div className="w-6 text-center font-mono">{parts.hour12}</div>
        <div className="flex flex-col ml-1">
          <button
            type="button"
            onClick={() => bumpHour(1)}
            disabled={disabled}
            className="h-4 w-4 flex items-center justify-center rounded hover:bg-gray-100 text-gray-500 disabled:text-gray-400"
            aria-label="Increase hour"
          >
            <FiChevronUp size={14} />
          </button>
          <button
            type="button"
            onClick={() => bumpHour(-1)}
            disabled={disabled}
            className="h-4 w-4 flex items-center justify-center rounded hover:bg-gray-100 text-gray-500 disabled:text-gray-400"
            aria-label="Decrease hour"
          >
            <FiChevronDown size={14} />
          </button>
        </div>
      </div>

      <span className="text-gray-400">:</span>

      {/* minute */}
      <div className="flex items-center">
        <div className="w-8 text-center font-mono">
          {String(parts.minute).padStart(2, "0")}
        </div>
        <div className="flex flex-col ml-1">
          <button
            type="button"
            onClick={() => bumpMinute(1)}
            disabled={disabled}
            className="h-4 w-4 flex items-center justify-center rounded hover:bg-gray-100 text-gray-500 disabled:text-gray-400"
            aria-label="Increase minutes"
          >
            <FiChevronUp size={14} />
          </button>
          <button
            type="button"
            onClick={() => bumpMinute(-1)}
            disabled={disabled}
            className="h-4 w-4 flex items-center justify-center rounded hover:bg-gray-100 text-gray-500 disabled:text-gray-400"
            aria-label="Decrease minutes"
          >
            <FiChevronDown size={14} />
          </button>
        </div>
      </div>

      {/* AM/PM */}
      <button
        type="button"
        onClick={() =>
          commit({ ...parts, ampm: parts.ampm === "AM" ? "PM" : "AM" })
        }
        disabled={disabled}
        className="ml-auto text-xs px-2 py-1 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-40"
        aria-label="Toggle AM/PM"
      >
        {parts.ampm}
      </button>
    </div>
  );
};

StepperTime.propTypes = {
  value: PropTypes.string.isRequired, // "HH:MM" 24h
  onChange: PropTypes.func.isRequired, // receives "HH:MM" 24h
  disabled: PropTypes.bool, // whether the stepper is disabled
};

/* ---------- The modal itself (unchanged) ---------- */
const WorkingHoursModal = ({ value = DEFAULT_WEEKLY, onClose, onSave }) => {
  const [local, setLocal] = useState(value);
  useEffect(() => {
    setLocal(value);
  }, [value]);

  const setRow = (idx, patch) =>
    setLocal((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], ...patch };
      return next;
    });

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-5">
          <div>
            <h3 className="text-xl font-semibold">Set Standard Hours</h3>
            <p className="text-sm text-gray-500 mt-1">
              Configure the standard hours of operation for this location.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 p-2"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="px-6 pb-6 mt-4 space-y-3">
          {local.map((d, idx) => (
            <div
              key={d.key}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            >
              {/* Left: day + switch */}
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="w-28 text-gray-800">{d.label}</div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={d.isOpen}
                  onClick={() => setRow(idx, { isOpen: !d.isOpen })}
                  className={`relative inline-flex h-5 w-10 items-center rounded-full transition ${
                    d.isOpen ? "bg-indigo-600" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      d.isOpen ? "translate-x-5" : "translate-x-1"
                    }`}
                  />
                </button>
                <span
                  className={`text-sm ${d.isOpen ? "text-indigo-700" : "text-gray-500"}`}
                >
                  {d.isOpen ? "Open" : "Closed"}
                </span>
              </div>

              {/* Right: steppers */}
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <StepperTime
                  value={d.open}
                  disabled={!d.isOpen}
                  onChange={(v) => setRow(idx, { open: v })}
                />
                <span className="text-gray-500 text-sm select-none">TO</span>
                <StepperTime
                  value={d.close}
                  disabled={!d.isOpen}
                  onChange={(v) => setRow(idx, { close: v })}
                />
              </div>
            </div>
          ))}

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="h-10 px-4 rounded-md border bg-white text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => onSave(local)}
              className="h-10 px-4 rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
            >
              Save Schedule
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

WorkingHoursModal.propTypes = {
  value: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      isOpen: PropTypes.bool.isRequired,
      open: PropTypes.string.isRequired, // "HH:MM"
      close: PropTypes.string.isRequired, // "HH:MM"
    })
  ),
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default WorkingHoursModal;
