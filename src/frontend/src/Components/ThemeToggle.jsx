import React from "react";
import PropTypes from "prop-types";
import { useTheme } from "../Context/ThemeContext";

const ThemeToggle = ({ className = "" }) => {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  const toggle = () => setTheme(isDark ? "light" : "dark");

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle dark mode"
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={`inline-flex items-center gap-2 rounded-full px-3 py-2 shadow-sm border 
                  bg-white/90 dark:bg-gray-800/90 border-gray-200 dark:border-gray-700
                  hover:bg-gray-50 dark:hover:bg-gray-700 transition ${className}`}
    >
      <span className="text-lg">{isDark ? "🌙" : "☀️"}</span>
      <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
        {isDark ? "Dark" : "Light"}
      </span>
    </button>
  );
};

ThemeToggle.propTypes = {
  className: PropTypes.string,
};

export default ThemeToggle;
