const moment = require("moment");
const client = require("../../../connection");
const block = require("../../block");
const district = require("../../District");
const state = require("../../State");
const subdivision = require("../../SubDivision");
const region = require("../../Region");
const country = require("../../Country");

const fetchers = {
  block: block.fetchBetweenDates,
  district: district.fetchBetweenDates,
  state: state.fetchBetweenDates,
  subdivision: subdivision.fetchBetweenDates,
  region: region.fetchBetweenDates,
  country: country.fetchBetweenDates,
};

const seasonsDef = [
  { name: "Jan-Feb", startMonth: 0, endMonth: 1 },
  { name: "Mar-May", startMonth: 2, endMonth: 4 },
  { name: "Jun-Sep", startMonth: 5, endMonth: 8 },
  { name: "Oct-Dec", startMonth: 9, endMonth: 11 },
];

// Insert functions with flexible field mappings & safety

async function insertBlockData(row, fromDate, toDate) {
  try {
    const blockIdRaw = row.block_code ?? row.blockcode;
    if (!blockIdRaw) {
      console.warn("Skipping block insert due to missing block_code:", row);
      return;
    }
    const blockId = BigInt(blockIdRaw);
    const actual = parseFloat(row.actual_rainfall ?? row.actualrainfall ?? 0);
    const departure = parseFloat(row.departure ?? 0);
    await client.query(
      `INSERT INTO block_data (block_id, from_date, to_date, actual, departure) VALUES ($1, $2, $3, $4, $5)`,
      [blockId, fromDate, toDate, actual, departure]
    );
    // console.log("    ✔️ Inserted block_data", blockId, fromDate, toDate);
  } catch (err) {
    console.error("Insert block_data error:", err, row);
  }
}

async function insertDistrictData(row, fromDate, toDate) {
  try {
    const districtIdRaw = row.district_code ?? row.districtcode;
    if (!districtIdRaw) {
      console.warn("Skipping district insert due to missing district_code:", row);
      return;
    }
    const districtId = BigInt(districtIdRaw);
    const actual = parseFloat(row.actual_rainfall ?? row.actualrainfall ?? 0);
    const departure = parseFloat(row.departure ?? 0);
    await client.query(
      `INSERT INTO district_data (district_id, from_date, to_date, actual, departure) VALUES ($1, $2, $3, $4, $5)`,
      [districtId, fromDate, toDate, actual, departure]
    );
    // console.log("    ✔️ Inserted district_data", districtId, fromDate, toDate);
  } catch (err) {
    console.error("Insert district_data error:", err, row);
  }
}

async function insertStateData(row, fromDate, toDate) {
  try {
    const stateIdRaw = row.state_code ?? row.statecode;
    if (!stateIdRaw) {
      console.warn("Skipping state insert due to missing state_code:", row);
      return;
    }
    const stateId = BigInt(stateIdRaw);
    const actual = parseFloat(row.actual_state_rainfall ?? row.actual_rainfall ?? row.actualrainfall ?? 0);
    const departure = parseFloat(row.departure ?? 0);
    await client.query(
      `INSERT INTO state_data (state_id, from_date, to_date, actual, departure) VALUES ($1, $2, $3, $4, $5)`,
      [stateId, fromDate, toDate, actual, departure]
    );
    // console.log("    ✔️ Inserted state_data", stateId, fromDate, toDate);
  } catch (err) {
    console.error("Insert state_data error:", err, row);
  }
}

async function insertSubDivisionData(row, fromDate, toDate) {
  try {
    const subDivisionIdRaw = row.sub_division_code ?? row.subdivisioncode ?? row.scode ?? row.s_code;
    if (!subDivisionIdRaw) {
      console.warn("Skipping subdivision insert due to missing sub_division_code:", row);
      return;
    }
    const subdivisionId = BigInt(subDivisionIdRaw);
    const actual = parseFloat(row.actual_subdiv_rainfall ?? row.actualsubdivrainfall ?? row.actual_rainfall ?? row.actualrainfall ?? 0);
    const departure = parseFloat(row.departure ?? 0);
    await client.query(
      `INSERT INTO subdivision_data (subdivision_id, from_date, to_date, actual, departure) VALUES ($1, $2, $3, $4, $5)`,
      [subdivisionId, fromDate, toDate, actual, departure]
    );
    // console.log("    ✔️ Inserted subdivision_data", subdivisionId, fromDate, toDate);
  } catch (err) {
    console.error("Insert subdivision_data error:", err, row);
  }
}

async function insertRegionData(row, fromDate, toDate) {
  try {
    const regionIdRaw = row.r_code ?? row.region_code ?? row.regioncode ?? row.rcode;
    if (!regionIdRaw) {
      console.warn("Skipping region insert due to missing region_code:", row);
      return;
    }
    const regionId = BigInt(regionIdRaw);
    const actual = parseFloat(row.actual_rainfall ?? row.actualrainfall ?? 0);
    const departure = parseFloat(row.departure ?? 0);
    await client.query(
      `INSERT INTO region_data (region_id, from_date, to_date, actual, departure) VALUES ($1, $2, $3, $4, $5)`,
      [regionId, fromDate, toDate, actual, departure]
    );
    // console.log("    ✔️ Inserted region_data", regionId, fromDate, toDate);
  } catch (err) {
    console.error("Insert region_data error:", err, row);
  }
}

async function insertCountryData(row, fromDate, toDate) {
  try {
    const countryIdRaw = row.country_code ?? row.countrycode ?? 1;
    const countryId = BigInt(countryIdRaw);
    const actual = parseFloat(row.actual_rainfall ?? row.actualrainfall ?? 0);
    const departure = parseFloat(row.departure ?? 0);
    await client.query(
      `INSERT INTO country_data (country_id, from_date, to_date, actual, departure) VALUES ($1, $2, $3, $4, $5)`,
      [countryId, fromDate, toDate, actual, departure]
    );
    // console.log("    ✔️ Inserted country_data", countryId, fromDate, toDate);
  } catch (err) {
    console.error("Insert country_data error:", err, row);
  }
}

const inserters = {
  block: insertBlockData,
  district: insertDistrictData,
  state: insertStateData,
  subdivision: insertSubDivisionData,
  region: insertRegionData,
  country: insertCountryData,
};

async function processLevel(label, fetchFunc, insertFunc, fromDate, toDate) {
  const currentDate = moment().format("YYYY-MM-DD");
  const specificTime = "07:50:15.744983+00";
  const specificDateTime = `${currentDate} ${specificTime}`;
  try {
    const rows = await fetchFunc(fromDate, toDate, currentDate, specificDateTime);
    console.log(`\n[${label}] API response for date range ${fromDate} to ${toDate}:`);
    if (!rows || !rows.length) {
      console.log("  (no data)");
      return;
    }
    for (const row of rows) {
      await insertFunc(row, fromDate, toDate);
    }
  } catch (err) {
    console.error(`[${label}] Error in fetchBetweenDates:`, err);
  }
}

// Calculate all days in the range inclusive
function getDaysInRange(startDate, endDate) {
  let days = [];
  for (let m = moment(startDate); m.isSameOrBefore(endDate); m.add(1, "days")) {
    days.push(m.format("YYYY-MM-DD"));
  }
  return days;
}

// Calculate all weeks (Thu-Wed) overlapping the range
function getWeeksInRange(startDate, endDate) {
  const start = moment(startDate);
  const end = moment(endDate);

  // Find Thursday on or before startDate
  let startWeekThursday = start.clone();
  while (startWeekThursday.day() !== 4) {
    startWeekThursday.subtract(1, "days");
  }

  let weeks = [];
  let currentStart = startWeekThursday.clone();

  while (currentStart.isSameOrBefore(end)) {
    const currentEnd = currentStart.clone().add(6, "days"); // Wednesday

    const periodStart = moment.max(currentStart, start);
    const periodEnd = moment.min(currentEnd, end);

    if (periodEnd.isBefore(periodStart)) {
      currentStart.add(7, "days");
      continue;
    }

    weeks.push({
      from: periodStart.format("YYYY-MM-DD"),
      to: periodEnd.format("YYYY-MM-DD"),
    });

    currentStart.add(7, "days");
  }

  return weeks;
}

// Calculate months overlapping date range (trimming edges)
function getMonthsInRange(startDate, endDate) {
  const start = moment(startDate).startOf("day");
  const end = moment(endDate).startOf("day");

  let months = [];
  let current = start.clone().startOf("month");

  while (current.isSameOrBefore(end)) {
    const from = moment.max(current, start).format("YYYY-MM-DD");
    const to = moment.min(current.clone().endOf("month"), end).format("YYYY-MM-DD");

    months.push({ from, to });

    current.add(1, "month");
  }

  return months;
}

// Calculate seasons overlapping range (trimming edges)
function getSeasonsInRange(startDate, endDate) {
  const start = moment(startDate);
  const end = moment(endDate);
  let seasons = [];

  const startYear = start.year();
  const endYear = end.year();

  for (let year = startYear; year <= endYear; year++) {
    for (const season of seasonsDef) {
      let seasonStart = moment([year, season.startMonth, 1]).startOf("day");
      let seasonEnd = moment([year, season.endMonth, 1]).endOf("month").startOf("day");

      if (seasonEnd.isBefore(start) || seasonStart.isAfter(end)) continue;

      const from = moment.max(seasonStart, start).format("YYYY-MM-DD");
      const to = moment.min(seasonEnd, end).format("YYYY-MM-DD");
      seasons.push({ name: season.name, from, to });
    }
  }

  return seasons;
}

// Core function aggregating all periods
async function processAggregationsForRange(startDate, endDate) {
  console.log(`Starting aggregation for range ${startDate} to ${endDate}`);

  // Daily
  const days = getDaysInRange(startDate, endDate);
  for (const day of days) {
    for (const label of Object.keys(fetchers)) {
      await processLevel(label, fetchers[label], inserters[label], day, day);
    }
  }

  // Weekly
  const weeks = getWeeksInRange(startDate, endDate);
  for (const { from, to } of weeks) {
    for (const label of Object.keys(fetchers)) {
      await processLevel(label, fetchers[label], inserters[label], from, to);
    }
  }

  // Monthly
  const months = getMonthsInRange(startDate, endDate);
  for (const { from, to } of months) {
    for (const label of Object.keys(fetchers)) {
      await processLevel(label, fetchers[label], inserters[label], from, to);
    }
  }

  // Seasonal
  const seasons = getSeasonsInRange(startDate, endDate);
  for (const { from, to } of seasons) {
    for (const label of Object.keys(fetchers)) {
      await processLevel(label, fetchers[label], inserters[label], from, to);
    }
  }

  console.log("Aggregation for range complete");
}

// Exported controller function for route
exports.aggregateRainfallData = async (req, res) => {
  try {
    const { startDate, endDate } = req.body;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: "startDate and endDate (YYYY-MM-DD) are required" });
    }
    if (!moment(startDate, "YYYY-MM-DD", true).isValid() ||
        !moment(endDate, "YYYY-MM-DD", true).isValid()) {
      return res.status(400).json({ error: "Invalid date format. Use YYYY-MM-DD" });
    }
    if (moment(startDate).isAfter(moment(endDate))) {
      return res.status(400).json({ error: "startDate cannot be after endDate" });
    }

    await processAggregationsForRange(startDate, endDate);

    return res.json({ message: `Successfully aggregated rainfall data from ${startDate} to ${endDate}` });
  } catch (err) {
    console.error("Aggregation error:", err);
    return res.status(500).json({ error: "Internal server error during aggregation" });
  }
};





// Function to get the current season's date range
function getCurrentSeasonRange() {
  const today = moment();
  const currentYear = today.year();
  let seasonStart, seasonEnd;

  for (const season of seasonsDef) {
    const start = moment([currentYear, season.startMonth, 1]).startOf('day');
    const end = moment([currentYear, season.endMonth, 1]).endOf('month').startOf('day');

    if (today.isSameOrAfter(start) && today.isSameOrBefore(end)) {
      seasonStart = start.format('YYYY-MM-DD');
      seasonEnd = end.format('YYYY-MM-DD');
      return { startDate: seasonStart, endDate: seasonEnd, seasonName: season.name };
    }
  }

  console.warn('No matching season found for today. Using current date as fallback.');
  return {
    startDate: today.format('YYYY-MM-DD'),
    endDate: today.format('YYYY-MM-DD'),
    seasonName: 'Unknown',
  };
}

async function deleteCurrentSeasonData(startDate, endDate) {
  const tables = [
    'block_data',
    'district_data',
    'state_data',
    'subdivision_data',
    'region_data',
    'country_data',
  ];

  const rowCounts = {};

  for (const table of tables) {
    try {
      const result = await client.query(
        `DELETE FROM public.${table} WHERE from_date >= $1 AND from_date <= $2`,
        [startDate, endDate]
      );
      rowCounts[table] = result.rowCount;
      console.log(`Deleted ${result.rowCount} rows from ${table} for season ${startDate} to ${endDate}`);
    } catch (err) {
      console.error(`Error deleting data from ${table}:`, err);
      rowCounts[table] = 0; // Set 0 for tables that fail
    }
  }

  return rowCounts;
}

async function aggregateCurrentSeasonData() {
  try {
    const today = moment().format('YYYY-MM-DD');
    console.log(`Starting aggregation for today: ${today}`);
    const rowCounts = await deleteCurrentSeasonData(today, today);
    console.log('Deletion summary:', rowCounts);
    await exports.aggregateRainfallData(
      { body: { startDate: today, endDate: today } },
      {
        json: (data) => console.log(data.message),
        status: () => ({ json: (err) => console.error(err.error) }),
      }
    );
    console.log(`Completed aggregation for ${today}`);
    return { rowCounts };
  } catch (err) {
    console.error('Error in aggregateCurrentSeasonData:', err);
    throw err;
  }
}

module.exports.aggregateCurrentSeasonData = aggregateCurrentSeasonData;