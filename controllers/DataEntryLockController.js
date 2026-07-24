const client = require("../connection");

// GET /api/v1/data-entry-lock
// Returns { is_locked: 0 or 1 }
exports.getLock = async (req, res) => {
    try {
        const result = await client.query(
            `SELECT is_locked FROM data_entry_lock WHERE id = 1`
        );
        const is_locked = result.rows.length > 0 ? result.rows[0].is_locked : 0;
        res.status(200).json({ success: true, is_locked });
    } catch (error) {
        console.error("[DATA ENTRY LOCK] getLock:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// POST /api/v1/data-entry-lock
// Body: { is_locked: 0 or 1 }
exports.setLock = async (req, res) => {
    try {
        const { is_locked } = req.body;
        if (is_locked !== 0 && is_locked !== 1) {
            return res.status(400).json({ success: false, message: "is_locked must be 0 or 1" });
        }
        await client.query(
            `INSERT INTO data_entry_lock (id, is_locked, updated_at)
             VALUES (1, $1, now())
             ON CONFLICT (id) DO UPDATE SET is_locked = $1, updated_at = now()`,
            [is_locked]
        );
        res.status(200).json({
            success: true,
            message: `Data entry ${is_locked === 1 ? "locked" : "unlocked"}`,
            is_locked
        });
    } catch (error) {
        console.error("[DATA ENTRY LOCK] setLock:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
