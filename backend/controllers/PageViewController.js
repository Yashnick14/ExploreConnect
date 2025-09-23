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
    const range = req.query.range || "monthly";
    let grouped = [];

    const matchStage = { path: "/home" };

    // 📅 Limit timeframe
    const now = new Date();
    let startDate;
    if (range === "weekly") {
      startDate = new Date();
      startDate.setDate(now.getDate() - 6); // last 7 days
    } else if (range === "monthly") {
      startDate = new Date();
      startDate.setDate(now.getDate() - 29); // last 30 days
    }
    if (startDate) {
      matchStage.timestamp = { $gte: startDate };
    }

    if (range === "weekly") {
      // Group by day of week
      let data = await PageView.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: { day: { $dayOfWeek: "$timestamp" } }, // 1=Sunday
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.day": 1 } },
      ]);

      // Map to Sun-Sat, filling missing with 0
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      grouped = days.map((day, i) => {
        const found = data.find((g) => g._id.day === i + 1);
        return { name: day, value: found ? found.count : 0 };
      });
    } else if (range === "monthly") {
      let data = await PageView.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: { week: { $week: "$timestamp" } },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.week": 1 } },
      ]);

      grouped = data.map((g, i) => ({
        name: `Week ${i + 1}`,
        value: g.count,
      }));
    }

    // Totals
    const total = grouped.reduce((sum, g) => sum + g.value, 0);

    res.json({ success: true, data: grouped, total });
  } catch (err) {
    console.error("❌ getVisitors error:", err.message);
    res.status(500).json({ success: false, error: "Failed to fetch visitors" });
  }
};
