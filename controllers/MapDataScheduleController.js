const client = require("../connection");

// GET /api/v1/map-data-schedule/:role
// Returns { restrict_days, publish } for the given role (hq|mc|sp|public)
exports.getSchedule = async (req, res) => {
    try {
        const role = (req.params.role || "").toLowerCase();
        const result = await client.query(
            `SELECT restrict_days, publish FROM map_data_schedules WHERE mcorhq_type = $1`,
            [role]
        );
        if (result.rows.length === 0) {
            return res.status(200).json({ success: true, restrict_days: null, publish: 0 });
        }
        res.status(200).json({ success: true, ...result.rows[0] });
    } catch (error) {
        console.error("[MAP DATA SCHEDULE] getSchedule:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// POST /api/v1/map-data-schedule
// Body: { mcorhq_type: 'mc'|'hq'|'sp'|'public', restrict_days: number|null, publish: 0|1 }
exports.setSchedule = async (req, res) => {
    try {
        const role = (req.body.mcorhq_type || "").toLowerCase();
        const { restrict_days, publish } = req.body;

        if (!['hq', 'mc', 'sp', 'public'].includes(role)) {
            return res.status(400).json({ success: false, message: "mcorhq_type must be one of hq, mc, sp, public" });
        }
        if (publish !== 0 && publish !== 1) {
            return res.status(400).json({ success: false, message: "publish must be 0 or 1" });
        }

        await client.query(
            `UPDATE map_data_schedules SET restrict_days = $2, publish = $3, updated_at = now() WHERE mcorhq_type = $1`,
            [role, restrict_days, publish]
        );
        res.status(200).json({ success: true, message: `Schedule updated for ${role}`, mcorhq_type: role, restrict_days, publish });
    } catch (error) {
        console.error("[MAP DATA SCHEDULE] setSchedule:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
