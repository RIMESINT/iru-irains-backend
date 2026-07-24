-- Cron Job Schedules Table
-- Stores admin-configurable schedules for backend cron jobs (controllers/CronJobs.js).
-- NOTE: this table is currently informational/admin-managed only — CronJobs.js is
-- not yet wired to read from it (to be done in a follow-up).
--
-- Run: psql -U postgres -d IRAINS -f migrations/create_cron_job_schedules.sql

CREATE TABLE IF NOT EXISTS cron_job_schedules (
    id                SERIAL PRIMARY KEY,
    job_key           VARCHAR(100) UNIQUE NOT NULL,
    job_group         VARCHAR(100) NOT NULL,
    job_name          VARCHAR(255) NOT NULL,
    description       TEXT,

    schedule_type     VARCHAR(20) NOT NULL DEFAULT 'daily_time', -- 'daily_time' | 'interval'

    -- used when schedule_type = 'daily_time' (runs once a day at this time)
    run_time          TIME,

    -- used when schedule_type = 'interval' (repeats every N minutes within a window)
    window_start_time TIME,
    window_end_time   TIME,
    interval_minutes  INT,

    timezone          VARCHAR(50) NOT NULL DEFAULT 'Asia/Kolkata',
    is_active         BOOLEAN NOT NULL DEFAULT TRUE,

    last_run_at       TIMESTAMPTZ,
    next_run_at       TIMESTAMPTZ,
    last_status       VARCHAR(20),
    last_error        TEXT,

    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_schedule_fields CHECK (
        (schedule_type = 'daily_time' AND run_time IS NOT NULL)
        OR
        (schedule_type = 'interval' AND window_start_time IS NOT NULL
            AND window_end_time IS NOT NULL AND interval_minutes IS NOT NULL)
    )
);

CREATE INDEX IF NOT EXISTS idx_cron_job_schedules_group ON cron_job_schedules (job_group);

CREATE OR REPLACE FUNCTION set_cron_job_schedules_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_cron_job_schedules_updated_at ON cron_job_schedules;
CREATE TRIGGER trg_cron_job_schedules_updated_at
BEFORE UPDATE ON cron_job_schedules
FOR EACH ROW
EXECUTE FUNCTION set_cron_job_schedules_updated_at();

-- ─── Seed data — mirrors current jobs in controllers/CronJobs.js ────────────

-- Add Daily Station Data: every 30 min, 1:00 PM - 6:00 PM
INSERT INTO cron_job_schedules
    (job_key, job_group, job_name, description, schedule_type, window_start_time, window_end_time, interval_minutes)
VALUES
    ('daily_station_data', 'daily_station_data', 'Add Daily Station Data',
     'Fetches and stores daily station data within the afternoon window',
     'interval', '13:00:00', '18:00:00', 30)
ON CONFLICT (job_key) DO NOTHING;

-- AWS Fetchers: every 15 min, all day
INSERT INTO cron_job_schedules
    (job_key, job_group, job_name, description, schedule_type, window_start_time, window_end_time, interval_minutes)
VALUES
    ('aws_fetchers', 'aws_fetchers', 'Run All AWS Fetchers',
     'Runs UP, NHP, Zomato, Meghalaya, Mizoram, Tamil Nadu, Uttarakhand, Telangana, Karnataka, IITM Mumbai fetchers',
     'interval', '00:00:00', '23:45:00', 15)
ON CONFLICT (job_key) DO NOTHING;

-- Seasonal data aggregation (once a day, fixed time)
INSERT INTO cron_job_schedules (job_key, job_group, job_name, description, schedule_type, run_time) VALUES
('aggregate_season_night',     'aggregate_season', 'Aggregate Current Season Data (Night)',     'Aggregates current season data across all dates', 'daily_time', '23:01:00'),
('aggregate_season_afternoon', 'aggregate_season', 'Aggregate Current Season Data (Afternoon)', 'Aggregates current season data across all dates', 'daily_time', '15:01:00')
ON CONFLICT (job_key) DO NOTHING;

-- Email reminders (once a day, fixed time)
INSERT INTO cron_job_schedules (job_key, job_group, job_name, description, schedule_type, run_time) VALUES
('daily_data_update_reminder',       'reminders', 'Daily Data Update Reminder Email',       'Sends reminder email to update daily station data', 'daily_time', '12:30:00'),
('daily_data_verification_reminder', 'reminders', 'Daily Data Verification Reminder Email', 'Sends reminder email to verify daily station data', 'daily_time', '13:15:00')
ON CONFLICT (job_key) DO NOTHING;

-- AWS station daily store (once a day, fixed time)
INSERT INTO cron_job_schedules (job_key, job_group, job_name, description, schedule_type, run_time) VALUES
('aws_station_daily_store', 'aws_station', 'AWS Station Daily Store', 'Runs daily store for AWS station data at 1:30 PM IST', 'daily_time', '13:30:00')
ON CONFLICT (job_key) DO NOTHING;
