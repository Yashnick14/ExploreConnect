// src/utils/normalizeUser.js
const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export const normalizeUser = (user) => {
  if (!user) return null;
  return {
    ...user,
    avatar: user.avatar
      ? user.avatar.startsWith("http")
        ? user.avatar
        : `${API_BASE}/${user.avatar.replace(/^\/+/, "")}`
      : null,
  };
};
