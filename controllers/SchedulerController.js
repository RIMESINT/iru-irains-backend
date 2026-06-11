const client = require("../connection");

// GET /api/v1/scheduler/jobs
exports.getAllSchedules = async (req, res) => {
    try {
        const result = await client.query(
            `SELECT * FROM cron_job_schedules ORDER BY job_group, job_key`
        );
        res.status(200).json({ success: true, data: result.rows });
    } catch (error) {
        console.error("[SCHEDULER] getAllSchedules:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// PUT /api/v1/scheduler/jobs/:id
// Body: { job_name?, description?, schedule_type, run_time?, window_start_time?,
//         window_end_time?, interval_minutes?, timezone?, is_active? }
// schedule_type is required and determines which time fields are stored.
exports.updateSchedule = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            job_name, description, schedule_type, run_time,
            window_start_time, window_end_time, interval_minutes,
            timezone, is_active,
        } = req.body;

        if (!['daily_time', 'interval'].includes(schedule_type)) {
            return res.status(400).json({ success: false, message: "schedule_type must be 'daily_time' or 'interval'" });
        }
        if (schedule_type === 'daily_time' && !run_time) {
            return res.status(400).json({ success: false, message: "run_time is required for schedule_type 'daily_time'" });
        }
        if (schedule_type === 'interval' && (!window_start_time || !window_end_time || !interval_minutes)) {
            return res.status(400).json({ success: false, message: "window_start_time, window_end_time and interval_minutes are required for schedule_type 'interval'" });
        }

        const result = await client.query(
            `UPDATE cron_job_schedules SET
                job_name          = COALESCE($1, job_name),
                description       = COALESCE($2, description),
                schedule_type     = $3,
                run_time          = $4,
                window_start_time = $5,
                window_end_time   = $6,
                interval_minutes  = $7,
                timezone          = COALESCE($8, timezone),
                is_active         = COALESCE($9, is_active)
             WHERE id = $10
             RETURNING *`,
            [
                job_name ?? null, description ?? null, schedule_type,
                schedule_type === 'daily_time' ? run_time : null,
                schedule_type === 'interval' ? window_start_time : null,
                schedule_type === 'interval' ? window_end_time : null,
                schedule_type === 'interval' ? interval_minutes : null,
                timezone ?? null, is_active ?? null, id,
            ]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Schedule not found" });
        }
        res.status(200).json({ success: true, message: "Schedule updated successfully", data: result.rows[0] });
    } catch (error) {
        console.error("[SCHEDULER] updateSchedule:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// PATCH /api/v1/scheduler/jobs/:id/toggle
exports.toggleSchedule = async (req, res) => {
    try {
        const { id } = req.params;
        const { is_active } = req.body;
        if (typeof is_active !== 'boolean') {
            return res.status(400).json({ success: false, message: "is_active must be a boolean" });
        }
        const result = await client.query(
            `UPDATE cron_job_schedules SET is_active = $1 WHERE id = $2 RETURNING *`,
            [is_active, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Schedule not found" });
        }
        res.status(200).json({ success: true, message: "Schedule status updated", data: result.rows[0] });
    } catch (error) {
        console.error("[SCHEDULER] toggleSchedule:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
