// backend/middleware/trackPageViews.js
const trackPageViews = async (req, res, next) => {
  // Do nothing, logging now handled in login flow
  next();
};

export default trackPageViews;
