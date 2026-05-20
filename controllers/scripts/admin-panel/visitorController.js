const client = require("../../../connection");  // same pg client you use everywhere
const moment = require('moment');

// Track a visit (called on every app open)
exports.trackVisit = async (req, res) => {
  const ip = req.headers['x-forwarded-for']?.split(',')[0].trim()
             || req.socket.remoteAddress;

  try {
    await client.query(`
      INSERT INTO app_daily_visitors (ip_address)
      VALUES ($1)
    `, [ip]);

    res.status(200).json({
      success: true,
      message: "Visit tracked successfully"
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to track visit",
      error: error.message
    });
  }
};

// Get today's unique visitor count
exports.getDailyCount = async (req, res) => {
  try {
    const result = await client.query(`
      SELECT COUNT(DISTINCT ip_address) AS daily_users
      FROM app_daily_visitors
      WHERE visit_date = CURRENT_DATE
    `);

    res.status(200).json({
      success: true,
      message: "Daily visitor count fetched successfully",
      count: parseInt(result.rows[0].daily_users, 10)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch visitor count",
      error: error.message
    });
  }
};

// Get total visitor count (all rows in the table)
exports.getTotalCount = async (req, res) => {
  try {
    const result = await client.query(`
      SELECT COUNT(*) AS total_visitors
      FROM app_daily_visitors
    `);

    res.status(200).json({
      success: true,
      message: "Total visitor count fetched successfully",
      count: parseInt(result.rows[0].total_visitors, 10)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch total visitor count",
      error: error.message
    });
  }
};

// Get last 30 days history
exports.getHistory = async (req, res) => {
  try {
    const result = await client.query(`
      SELECT
        visit_date,
        COUNT(DISTINCT ip_address) AS unique_visitors,
        COUNT(*)                   AS total_opens
      FROM app_daily_visitors
      WHERE visit_date >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY visit_date
      ORDER BY visit_date DESC
    `);

    res.status(200).json({
      success: true,
      message: "Visitor history fetched successfully",
      data: result.rows
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch visitor history",
      error: error.message
    });
  }
};
