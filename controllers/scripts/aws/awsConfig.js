const moment = require("moment-timezone");

const IST = "Asia/Kolkata";

// ─── GLOBAL AWS DAY BOUNDARY ──────────────────────────────────────────────────
// A rainfall day is named for the date it ENDS on, and runs 08:30 IST → 08:30
// IST — the same window the MCs/RMCs use for manual data entry, so State AWS
// totals and manually entered totals cover the identical 24 hours.
//
//   aws_day 07 Aug  =  06 Aug 08:30 IST → 07 Aug 08:30 IST
//                   =  06 Aug 03:00 UTC → 07 Aug 03:00 UTC
//
// dat/time from city.imd.gov.in are UTC. Verified live against the feed: at
// 14:05 UTC the newest reading was 13:45 with updated_at 14:00:55 — a 15-minute
// slot with a 15-minute publishing lag. Read as IST it would have been six
// hours stale. The diurnal temperature cycle agrees: mean temperature peaks at
// raw hour 08:00 (13:30 IST) and bottoms at 00:00 (05:30 IST).
//
// So the label is date(UTC - 3:00) + 1, which folds to adding 21 hours and
// truncating. Most of a day's rows therefore carry the PREVIOUS calendar date,
// exactly as they do for manual entry.
const AWS_DAY_EXPR = `(dat::date + time::time + INTERVAL '21 hours')::date`;

// The most recently COMPLETED AWS day (YYYY-MM-DD).
//
// Day D closes at D 03:00 UTC, so subtracting three hours from "now" lands on
// the last window that has actually closed — what the daily store must write
// and what a report should default to. Adding 2:30 (the previous formula)
// happened to agree during the afternoon but went a day wrong between 00:00 and
// 03:00 UTC, which is exactly when the day rolls over.
const getAwsToday = () => {
    return moment.utc().subtract(3, "hours").format("YYYY-MM-DD");
};

// Standard resolveDates helper shared by all state controllers
const resolveDates = (startDate, endDate) => {
    const today = getAwsToday();
    if (!startDate && !endDate) return { startDate: today, endDate: today };
    if (!startDate) return { startDate: endDate, endDate };
    if (!endDate)   return { startDate, endDate: startDate };
    return { startDate, endDate };
};

module.exports = { IST, AWS_DAY_EXPR, getAwsToday, resolveDates };
