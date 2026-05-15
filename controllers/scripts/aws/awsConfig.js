const moment = require("moment-timezone");

const IST = "Asia/Kolkata";

// ─── GLOBAL AWS DAY BOUNDARY ──────────────────────────────────────────────────
// AWS day boundary: 21:30 UTC = 03:00 IST (next day label)
// Day D spans (D-1) 21:30 UTC → D 21:30 UTC; day is labelled by the END date.
// Adding 2h30m to UTC time and taking the date gives the correct end-date label.
const AWS_DAY_EXPR = `(dat::date + time::time + INTERVAL '2 hours 30 minutes')::date`;

// Returns the current AWS "today" (YYYY-MM-DD, UTC+2:30 shifted)
const getAwsToday = () => {
    return moment.utc().add(2, "hours").add(30, "minutes").format("YYYY-MM-DD");
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
