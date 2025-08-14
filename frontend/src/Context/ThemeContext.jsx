import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Prefer saved theme; else system preference; else light
  const getInitial = () => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark" || saved === "light") return saved;
    const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)")?.matches;
    return prefersDark ? "dark" : "light";
  };

  const [theme, setTheme] = useState(getInitial);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Keep in sync if user changes OS theme while using “system” in future (optional)
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      const saved = localStorage.getItem("theme");
      if (!saved) setTheme(mq.matches ? "dark" : "light");
    };
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);

  const value = useMemo(() => ({ theme, setTheme }), [theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);
