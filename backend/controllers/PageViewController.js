import PageView from "../models/PageViewModel.js";

// Log visitor
export const logVisitor = async (req, res) => {
  try {
    const { path = "/home" } = req.body; // default to /home
    await PageView.create({ path, ip: req.ip });
    res.json({ success: true });
  } catch (err) {
    console.error("❌ logVisitor error:", err.message);
    res.status(500).json({ success: false, error: "Failed to log visitor" });
  }
};

// Get visitors
export const getVisitors = async (req, res) => {
  try {
    const range = req.query.range || "monthly"; // default monthly
    let grouped = [];

    const matchStage = { path: "/home" }; // only homepage visits

    if (range === "weekly") {
      grouped = await PageView.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: { day: { $dayOfWeek: "$timestamp" } },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.day": 1 } },
      ]);
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      grouped = grouped.map((g) => ({
        name: days[g._id.day - 1],
        value: g.count,
      }));
    } else if (range === "monthly") {
      grouped = await PageView.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: { week: { $week: "$timestamp" } },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.week": 1 } },
      ]);
      grouped = grouped.map((g, i) => ({
        name: `Week ${i + 1}`,
        value: g.count,
      }));
    }

    res.json({ success: true, data: grouped });
  } catch (err) {
    console.error("❌ getVisitors error:", err.message);
    res.status(500).json({ success: false, error: "Failed to fetch visitors" });
  }
};
