const client = require("../connection");

// GET /api/v1/cron-schedules
exports.getAllSchedules = async (req, res) => {
    try {
        const result = await client.query(
            `SELECT * FROM cron_job_schedules ORDER BY job_group, id`
        );
        res.status(200).json({ success: true, data: result.rows });
    } catch (error) {
        console.error("[CRON SCHEDULES] getAllSchedules:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// POST /api/v1/cron-schedules
exports.createSchedule = async (req, res) => {
    try {
        const {
            job_key, job_group, job_name, description,
            schedule_type, run_time,
            window_start_time, window_end_time, interval_minutes,
            timezone, is_active
        } = req.body;

        if (!job_key || !job_group || !job_name || !schedule_type) {
            return res.status(400).json({ success: false, message: "job_key, job_group, job_name and schedule_type are required" });
        }
        if (schedule_type === 'daily_time' && !run_time) {
            return res.status(400).json({ success: false, message: "run_time is required for daily_time schedules" });
        }
        if (schedule_type === 'interval' && (!window_start_time || !window_end_time || !interval_minutes)) {
            return res.status(400).json({ success: false, message: "window_start_time, window_end_time and interval_minutes are required for interval schedules" });
        }

        const result = await client.query(
            `INSERT INTO cron_job_schedules
                (job_key, job_group, job_name, description, schedule_type, run_time,
                 window_start_time, window_end_time, interval_minutes, timezone, is_active)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9, COALESCE($10, 'Asia/Kolkata'), COALESCE($11, true))
             RETURNING *`,
            [
                job_key, job_group, job_name, description ?? null,
                schedule_type,
                schedule_type === 'daily_time' ? run_time : null,
                schedule_type === 'interval' ? window_start_time : null,
                schedule_type === 'interval' ? window_end_time : null,
                schedule_type === 'interval' ? interval_minutes : null,
                timezone, is_active
            ]
        );
        res.status(201).json({ success: true, message: "Schedule created", data: result.rows[0] });
    } catch (error) {
        if (error.code === '23505') {
            return res.status(409).json({ success: false, message: `job_key '${req.body.job_key}' already exists` });
        }
        console.error("[CRON SCHEDULES] createSchedule:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// PUT /api/v1/cron-schedules/:job_key
exports.updateSchedule = async (req, res) => {
    try {
        const { job_key } = req.params;
        const {
            job_group, job_name, description,
            schedule_type, run_time,
            window_start_time, window_end_time, interval_minutes,
            timezone, is_active
        } = req.body;

        if (!job_group || !job_name || !schedule_type) {
            return res.status(400).json({ success: false, message: "job_group, job_name and schedule_type are required" });
        }
        if (schedule_type === 'daily_time' && !run_time) {
            return res.status(400).json({ success: false, message: "run_time is required for daily_time schedules" });
        }
        if (schedule_type === 'interval' && (!window_start_time || !window_end_time || !interval_minutes)) {
            return res.status(400).json({ success: false, message: "window_start_time, window_end_time and interval_minutes are required for interval schedules" });
        }

        const result = await client.query(
            `UPDATE cron_job_schedules SET
                job_group = $1,
                job_name = $2,
                description = $3,
                schedule_type = $4,
                run_time = $5,
                window_start_time = $6,
                window_end_time = $7,
                interval_minutes = $8,
                timezone = COALESCE($9, timezone),
                is_active = COALESCE($10, is_active)
             WHERE job_key = $11
             RETURNING *`,
            [
                job_group, job_name, description ?? null,
                schedule_type,
                schedule_type === 'daily_time' ? run_time : null,
                schedule_type === 'interval' ? window_start_time : null,
                schedule_type === 'interval' ? window_end_time : null,
                schedule_type === 'interval' ? interval_minutes : null,
                timezone, is_active,
                job_key
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: `Schedule '${job_key}' not found` });
        }

        res.status(200).json({ success: true, message: "Schedule updated", data: result.rows[0] });
    } catch (error) {
        console.error("[CRON SCHEDULES] updateSchedule:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// PATCH /api/v1/cron-schedules/:job_key/toggle
exports.toggleSchedule = async (req, res) => {
    try {
        const { job_key } = req.params;
        const { is_active } = req.body;

        if (typeof is_active !== 'boolean') {
            return res.status(400).json({ success: false, message: "is_active (boolean) is required" });
        }

        const result = await client.query(
            `UPDATE cron_job_schedules SET is_active = $1 WHERE job_key = $2 RETURNING *`,
            [is_active, job_key]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: `Schedule '${job_key}' not found` });
        }

        res.status(200).json({ success: true, message: "Schedule status updated", data: result.rows[0] });
    } catch (error) {
        console.error("[CRON SCHEDULES] toggleSchedule:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// DELETE /api/v1/cron-schedules/:job_key
exports.deleteSchedule = async (req, res) => {
    try {
        const { job_key } = req.params;
        const result = await client.query(
            `DELETE FROM cron_job_schedules WHERE job_key = $1 RETURNING *`,
            [job_key]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: `Schedule '${job_key}' not found` });
        }

        res.status(200).json({ success: true, message: "Schedule deleted" });
    } catch (error) {
        console.error("[CRON SCHEDULES] deleteSchedule:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
