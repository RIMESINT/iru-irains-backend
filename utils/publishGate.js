const moment = require("moment");
const client = require("../connection");

// Every role that has to sign off before data may leave the building. The
// auto-publish cron flips all four together (2:00 PM IST publish, 12:00 AM IST
// hold back — see CronJobs.js), but an admin can hold any single role back from
// Review and Publish, and one held-back role gates every export API.
const GATED_ROLES = ["hq", "mc", "sp", "public"];

const getHeldBackRoles = async () => {
    try {
        const result = await client.query(
            `SELECT mcorhq_type, publish FROM public.map_data_schedules
              WHERE mcorhq_type = ANY($1)`,
            [GATED_ROLES]
        );
        const publishByRole = new Map(
            result.rows.map((row) => [row.mcorhq_type, Number(row.publish)])
        );
        // A missing row counts as held back, matching MapDataScheduleController,
        // which reports publish: 0 for a role with no schedule configured.
        return GATED_ROLES.filter((role) => publishByRole.get(role) !== 1);
    } catch (error) {
        // Fail closed: if the gate can't be read, treat the data as unpublished
        // rather than exporting figures that may still be under review.
        console.error("[PUBLISH GATE] Failed to read map_data_schedules:", error.message);
        return [...GATED_ROLES];
    }
};

const yesterdayOf = (today) =>
    moment(today, "YYYY-MM-DD").subtract(1, "day").format("YYYY-MM-DD");

/**
 * Gate for the date-range export APIs. `today` is a parameter rather than being
 * derived here because the AWS exports run on an IST-shifted UTC day, not the
 * server's local day.
 *
 * Returns the range that should actually be queried, whether the request was
 * clamped, and — when clamping collapses the range to nothing — an emptyRange
 * flag so the caller can skip the query instead of returning a null aggregate.
 */
exports.applyPublishGateToRange = async (fromDate, toDate, today) => {
    const latestAllowed = yesterdayOf(today);

    // Range already predates today's unpublished data — nothing to gate, and no
    // reason to spend a query on the schedule table.
    if (!moment(toDate, "YYYY-MM-DD").isAfter(latestAllowed)) {
        return { fromDate, toDate, heldBack: false, emptyRange: false };
    }

    const heldBackRoles = await getHeldBackRoles();
    if (heldBackRoles.length === 0) {
        return { fromDate, toDate, heldBack: false, emptyRange: false };
    }

    return {
        fromDate,
        toDate: latestAllowed,
        heldBack: true,
        // fromDate was today as well, so clamping leaves nothing to return.
        emptyRange: moment(fromDate, "YYYY-MM-DD").isAfter(latestAllowed)
    };
};

/**
 * Gate for the single-date export APIs (the NWP station exports). Falls back to
 * yesterday when today is held back, mirroring the frontend's
 * MapDataScheduleService.getEffectiveLatestDate().
 */
exports.applyPublishGateToDate = async (date, today) => {
    const latestAllowed = yesterdayOf(today);

    if (!moment(date, "YYYY-MM-DD").isAfter(latestAllowed)) {
        return { date, heldBack: false };
    }

    const heldBackRoles = await getHeldBackRoles();
    if (heldBackRoles.length === 0) {
        return { date, heldBack: false };
    }

    return {
        date: latestAllowed,
        heldBack: true
    };
};
