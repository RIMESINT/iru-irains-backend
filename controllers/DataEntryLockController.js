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

// POST /api/v1/data-entry-lock-history
// Body: { date: 'YYYY-MM-DD' }
// Returns the lock state in effect at the start of that day, plus every
// transition recorded during it — enough to render a full-day timeline with
// no gaps. Populated by the trg_data_entry_lock_history trigger (see
// migrations/create_data_entry_lock_history.sql), not by application code.
exports.getLockHistoryForDate = async (req, res) => {
    try {
        const { date } = req.body;
        const targetDate = date || new Date().toISOString().slice(0, 10);

        const initialRes = await client.query(
            `SELECT is_locked FROM public.data_entry_lock_history
              WHERE changed_at < $1::date
              ORDER BY changed_at DESC LIMIT 1`,
            [targetDate]
        );
        const initialState = initialRes.rows[0]?.is_locked ?? 0;

        const transitionsRes = await client.query(
            `SELECT is_locked, changed_at FROM public.data_entry_lock_history
              WHERE changed_at::date = $1::date
              ORDER BY changed_at ASC`,
            [targetDate]
        );

        res.status(200).json({
            success: true,
            date: targetDate,
            initialState,
            transitions: transitionsRes.rows
        });
    } catch (error) {
        console.error("[DATA ENTRY LOCK] getLockHistoryForDate:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
