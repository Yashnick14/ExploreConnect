// src/utils/normalizeUser.js
const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export const normalizeUser = (user) => {
  if (!user) return null;

  let avatarUrl = null;

  if (user.avatar) {
    if (user.avatar.startsWith("http")) {
      avatarUrl = user.avatar; // already full url
    } else if (user.avatar.startsWith("/avatars/")) {
      // ✅ predefined avatar from public folder
      avatarUrl = user.avatar; // served directly from /public
    } else {
      // ✅ uploaded avatar from backend
      avatarUrl = `${API_BASE}/${user.avatar.replace(/^\/+/, "")}`;
    }
  }

  return {
    ...user,
    avatar: avatarUrl,
    membership: user.membership
      ? {
          isMember: !!user.membership.isMember,
          plan: user.membership.plan || null,
          currentPeriodEnd: user.membership.currentPeriodEnd
            ? new Date(user.membership.currentPeriodEnd).toISOString()
            : null,
          lastRedeemedAt: user.membership.lastRedeemedAt
            ? new Date(user.membership.lastRedeemedAt).toISOString()
            : null,
          lastRedeemed: user.membership.lastRedeemed || null,
          points:
            typeof user.membership.points === "number"
              ? user.membership.points
              : 0,
        }
      : {
          isMember: false,
          plan: null,
          currentPeriodEnd: null,
          lastRedeemedAt: null,
          lastRedeemed: null,
          points: 0,
        },
  };
};
