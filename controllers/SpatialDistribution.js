const client = require("../connection");
const moment = require("moment");
/**
 * GET /api/v1/getSpatialDistributionData
 * Query params:
 *  - date=YYYY-MM-DD                (single day)
 *  - startDate=YYYY-MM-DD&endDate=YYYY-MM-DD  (period aggregate by default)
 *  - mode=daywise                    (use with startDate/endDate to get daily breakdown)
 */

exports.getSpatialDistributionData = async (req, res) => {
  try {
    const { date, startDate, endDate, mode } = req.query;

    // console.log("mode", mode);
    // console.log("date", date);
    // console.log("startDate", startDate);
    // console.log("endDate", endDate);

    const isValidDate = (d) => moment(d, "YYYY-MM-DD", true).isValid();

    // ---------- Daywise Mode ----------
    if (mode === "daywise") {
      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: "startDate and endDate are required for daywise mode.",
        });
      }
      if (!isValidDate(startDate) || !isValidDate(endDate)) {
        return res.status(400).json({
          success: false,
          message: "startDate and endDate must be in YYYY-MM-DD format.",
        });
      }
      if (moment(endDate).isBefore(moment(startDate))) {
        return res.status(400).json({
          success: false,
          message: "endDate must be same or after startDate.",
        });
      }

      const daywiseQuery = `
        WITH dates AS (
          SELECT generate_series($1::date, $2::date, interval '1 day')::date AS collection_date
        ),
        total_stations AS (
          SELECT n.subdiv_name, MIN(n.id) AS id, COUNT(s.station_code) AS total_stations
          FROM normal_district_details n
          LEFT JOIN station_details s ON n.district_code = s.district_code AND s.flag != 0
          GROUP BY n.subdiv_name
        ),
        subdiv_date_stats AS (
          SELECT
            n.subdiv_name,
            d.collection_date,
            COUNT(DISTINCT sdd.station_id) AS valid_stations,
            COUNT(DISTINCT CASE WHEN sdd.data >= 0.1 THEN sdd.station_id END) AS station_reported_rainfall
          FROM normal_district_details n
          CROSS JOIN dates d
          LEFT JOIN station_daily_data sdd
            ON n.district_code = sdd.district_code
            AND sdd.collection_date = d.collection_date
          GROUP BY n.subdiv_name, d.collection_date
        )
        SELECT
          sd.collection_date,
          t.id,
          t.subdiv_name AS subdivision_name,
          t.total_stations,
          sd.valid_stations,
          sd.station_reported_rainfall,
          CASE
            WHEN COALESCE(sd.valid_stations,0) = 0 THEN NULL
            ELSE ROUND((COALESCE(sd.station_reported_rainfall,0)::decimal / sd.valid_stations) * 100, 2)
          END AS percentage,
          CASE
            WHEN COALESCE(sd.valid_stations,0) = 0 THEN NULL
            WHEN (COALESCE(sd.station_reported_rainfall,0)::decimal / sd.valid_stations) * 100 <= 25 THEN 'Isolated'
            WHEN (COALESCE(sd.station_reported_rainfall,0)::decimal / sd.valid_stations) * 100 > 25
                 AND (COALESCE(sd.station_reported_rainfall,0)::decimal / sd.valid_stations) * 100 <= 50 THEN 'Scattered'
            WHEN (COALESCE(sd.station_reported_rainfall,0)::decimal / sd.valid_stations) * 100 > 50
                 AND (COALESCE(sd.station_reported_rainfall,0)::decimal / sd.valid_stations) * 100 <= 75 THEN 'Fairly Widespread'
            WHEN (COALESCE(sd.station_reported_rainfall,0)::decimal / sd.valid_stations) * 100 > 75 THEN 'Widespread'
          END AS category
        FROM total_stations t
        JOIN subdiv_date_stats sd ON t.subdiv_name = sd.subdiv_name
        ORDER BY sd.collection_date, subdivision_name;
      `;

      const daywiseResult = await client.query(daywiseQuery, [
        startDate,
        endDate,
      ]);

      // Group rows into an object keyed by date
      const grouped = {};
      daywiseResult.rows.forEach((r) => {
        const d =
          r.collection_date instanceof Date
            ? moment(r.collection_date).format("YYYY-MM-DD")
            : r.collection_date;

        if (!grouped[d]) grouped[d] = [];
        grouped[d].push({
          id: r.id,
          subdivision_name: r.subdivision_name,
          total_stations: Number(r.total_stations),
          valid_stations: Number(r.valid_stations),
          station_reported_rainfall: Number(r.station_reported_rainfall),
          percentage: r.percentage !== null ? Number(r.percentage) : null,
          category: r.category,
        });
      });

      // ✅ Ensure dates are sorted and returned as an object
      const sortedKeys = Object.keys(grouped).sort();
      const sortedData = {};
      sortedKeys.forEach((d) => {
        sortedData[d] = grouped[d];
      });

      return res.status(200).json({
        success: true,
        mode: "daywise",
        startDate,
        endDate,
        data: sortedData,
      });
    }

    // ---------- Non-daywise Mode (Single Date / Period Aggregate) ----------
    if ((startDate && !endDate) || (!startDate && endDate)) {
      return res.status(400).json({
        success: false,
        message: "Both startDate and endDate are required for period mode.",
      });
    }
    if (startDate && endDate) {
      if (!isValidDate(startDate) || !isValidDate(endDate)) {
        return res.status(400).json({
          success: false,
          message: "startDate and endDate must be in YYYY-MM-DD format.",
        });
      }
      if (moment(endDate).isBefore(moment(startDate))) {
        return res.status(400).json({
          success: false,
          message: "endDate must be same or after startDate.",
        });
      }
    }

    // ---------- Period Aggregate ----------
    const queryParams = [startDate, endDate];
    const periodAggQuery = `
      WITH total_stations AS (
        SELECT n.subdiv_name, MIN(n.id) AS id, COUNT(s.station_code) AS total_stations
        FROM normal_district_details n
        LEFT JOIN station_details s ON n.district_code = s.district_code
        GROUP BY n.subdiv_name
      ),
      reported_stations AS (
        SELECT n.subdiv_name, COUNT(DISTINCT d.station_id) AS station_reported_rainfall
        FROM normal_district_details n
        JOIN station_daily_data d ON n.district_code = d.district_code
        WHERE d.collection_date BETWEEN $1 AND $2 AND d.data >= 0.1
        GROUP BY n.subdiv_name
      ),
      valid_stations AS (
        SELECT n.subdiv_name, COUNT(DISTINCT d.station_id) AS valid_stations
        FROM normal_district_details n
        JOIN station_daily_data d ON n.district_code = d.district_code
        WHERE d.collection_date BETWEEN $1 AND $2
        GROUP BY n.subdiv_name
      )
      SELECT
        t.id,
        t.subdiv_name AS subdivision_name,
        t.total_stations,
        COALESCE(v.valid_stations,0) AS valid_stations,
        COALESCE(r.station_reported_rainfall,0) AS station_reported_rainfall,
        CASE WHEN COALESCE(v.valid_stations,0)=0 THEN NULL
             ELSE ROUND((COALESCE(r.station_reported_rainfall,0)::decimal / v.valid_stations) * 100, 2)
        END AS percentage,
        CASE
          WHEN COALESCE(v.valid_stations,0)=0 THEN NULL
          WHEN (COALESCE(r.station_reported_rainfall,0)::decimal / v.valid_stations) * 100 <= 25 THEN 'Isolated'
          WHEN (COALESCE(r.station_reported_rainfall,0)::decimal / v.valid_stations) * 100 > 25
               AND (COALESCE(r.station_reported_rainfall,0)::decimal / v.valid_stations) * 100 <= 50 THEN 'Scattered'
          WHEN (COALESCE(r.station_reported_rainfall,0)::decimal / v.valid_stations) * 100 > 50
               AND (COALESCE(r.station_reported_rainfall,0)::decimal / v.valid_stations) * 100 <= 75 THEN 'Fairly Widespread'
          WHEN (COALESCE(r.station_reported_rainfall,0)::decimal / v.valid_stations) * 100 > 75 THEN 'Widespread'
        END AS category
      FROM total_stations t
      LEFT JOIN reported_stations r ON t.subdiv_name = r.subdiv_name
      LEFT JOIN valid_stations v ON t.subdiv_name = v.subdiv_name
      ORDER BY subdivision_name;
    `;
    const result = await client.query(periodAggQuery, queryParams);
    return res.status(200).json({
      success: true,
      mode: "period",
      startDate,
      endDate,
      data: result.rows,
    });
  } catch (error) {
    console.error("Error fetching spatial distribution data:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

exports.getSpatialDistributionDataState = async (req, res) => {
  try {
    const { date, startDate, endDate, mode } = req.query;

    // console.log("mode (state-level)", mode);

    const isValidDate = (d) => moment(d, "YYYY-MM-DD", true).isValid();

    // ---------- Daywise ----------
    if (mode === "daywise") {
      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: "startDate and endDate are required for daywise mode.",
        });
      }
      if (!isValidDate(startDate) || !isValidDate(endDate)) {
        return res.status(400).json({
          success: false,
          message: "startDate and endDate must be in YYYY-MM-DD format.",
        });
      }
      if (moment(endDate).isBefore(moment(startDate))) {
        return res.status(400).json({
          success: false,
          message: "endDate must be same or after startDate.",
        });
      }

      const daywiseQuery = `
        WITH dates AS (
          SELECT generate_series($1::date, $2::date, interval '1 day')::date AS collection_date
        ),
        total_stations AS (
          SELECT n.state_name, MIN(n.id) AS id, COUNT(s.station_code) AS total_stations
          FROM normal_district_details n
          LEFT JOIN station_details s ON n.district_code = s.district_code AND s.flag != 0
          GROUP BY n.state_name
        ),
        date_stats AS (
          SELECT
            n.state_name,
            d.collection_date,
            COUNT(DISTINCT sdd.station_id) AS valid_stations,
            COUNT(DISTINCT CASE WHEN sdd.data >= 0.1 THEN sdd.station_id END) AS station_reported_rainfall
          FROM normal_district_details n
          CROSS JOIN dates d
          LEFT JOIN station_daily_data sdd
            ON n.district_code = sdd.district_code
            AND sdd.collection_date = d.collection_date
          GROUP BY n.state_name, d.collection_date
        )
        SELECT
          ds.collection_date,
          t.id,
          t.state_name,
          t.total_stations,
          ds.valid_stations,
          ds.station_reported_rainfall,
          CASE
            WHEN COALESCE(ds.valid_stations,0) = 0 THEN NULL
            ELSE ROUND((COALESCE(ds.station_reported_rainfall,0)::decimal / ds.valid_stations) * 100, 2)
          END AS percentage,
          CASE
            WHEN COALESCE(ds.valid_stations,0) = 0 THEN NULL
            WHEN (COALESCE(ds.station_reported_rainfall,0)::decimal / ds.valid_stations) * 100 <= 25 THEN 'Isolated'
            WHEN (COALESCE(ds.station_reported_rainfall,0)::decimal / ds.valid_stations) * 100 > 25
                 AND (COALESCE(ds.station_reported_rainfall,0)::decimal / ds.valid_stations) * 100 <= 50 THEN 'Scattered'
            WHEN (COALESCE(ds.station_reported_rainfall,0)::decimal / ds.valid_stations) * 100 > 50
                 AND (COALESCE(ds.station_reported_rainfall,0)::decimal / ds.valid_stations) * 100 <= 75 THEN 'Fairly Widespread'
            WHEN (COALESCE(ds.station_reported_rainfall,0)::decimal / ds.valid_stations) * 100 > 75 THEN 'Widespread'
          END AS category
        FROM total_stations t
        JOIN date_stats ds ON t.state_name = ds.state_name
        ORDER BY ds.collection_date, state_name;
      `;

      const daywiseResult = await client.query(daywiseQuery, [
        startDate,
        endDate,
      ]);

      // group into dictionary by date
      const grouped = {};
      daywiseResult.rows.forEach((r) => {
        const d = moment(r.collection_date).format("YYYY-MM-DD");
        if (!grouped[d]) grouped[d] = [];
        grouped[d].push({
          id: r.id,
          state_name: r.state_name,
          total_stations: Number(r.total_stations),
          valid_stations: Number(r.valid_stations),
          station_reported_rainfall: Number(r.station_reported_rainfall),
          percentage: r.percentage !== null ? Number(r.percentage) : null,
          category: r.category,
        });
      });

      const sortedData = {};
      Object.keys(grouped)
        .sort()
        .forEach((d) => (sortedData[d] = grouped[d]));

      return res.status(200).json({
        success: true,
        mode: "daywise",
        level: "state",
        startDate,
        endDate,
        data: sortedData,
      });
    }

    // ---------- Period ----------
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "startDate and endDate are required for period mode.",
      });
    }

    const queryParams = [startDate, endDate];
    const periodAggQuery = `
      WITH total_stations AS (
        SELECT n.state_name, MIN(n.id) AS id, COUNT(s.station_code) AS total_stations
        FROM normal_district_details n
        LEFT JOIN station_details s ON n.district_code = s.district_code
        GROUP BY n.state_name
      ),
      reported_stations AS (
        SELECT n.state_name, COUNT(DISTINCT d.station_id) AS station_reported_rainfall
        FROM normal_district_details n
        JOIN station_daily_data d ON n.district_code = d.district_code
        WHERE d.collection_date BETWEEN $1 AND $2 AND d.data >= 0.1
        GROUP BY n.state_name
      ),
      valid_stations AS (
        SELECT n.state_name, COUNT(DISTINCT d.station_id) AS valid_stations
        FROM normal_district_details n
        JOIN station_daily_data d ON n.district_code = d.district_code
        WHERE d.collection_date BETWEEN $1 AND $2
        GROUP BY n.state_name
      )
      SELECT
        t.id,
        t.state_name,
        t.total_stations,
        COALESCE(v.valid_stations,0) AS valid_stations,
        COALESCE(r.station_reported_rainfall,0) AS station_reported_rainfall,
        CASE WHEN COALESCE(v.valid_stations,0)=0 THEN NULL
             ELSE ROUND((COALESCE(r.station_reported_rainfall,0)::decimal / v.valid_stations) * 100, 2)
        END AS percentage,
        CASE
          WHEN COALESCE(v.valid_stations,0)=0 THEN NULL
          WHEN (COALESCE(r.station_reported_rainfall,0)::decimal / v.valid_stations) * 100 <= 25 THEN 'Isolated'
          WHEN (COALESCE(r.station_reported_rainfall,0)::decimal / v.valid_stations) * 100 > 25
               AND (COALESCE(r.station_reported_rainfall,0)::decimal / v.valid_stations) * 100 <= 50 THEN 'Scattered'
          WHEN (COALESCE(r.station_reported_rainfall,0)::decimal / v.valid_stations) * 100 > 50
               AND (COALESCE(r.station_reported_rainfall,0)::decimal / v.valid_stations) * 100 <= 75 THEN 'Fairly Widespread'
          WHEN (COALESCE(r.station_reported_rainfall,0)::decimal / v.valid_stations) * 100 > 75 THEN 'Widespread'
        END AS category
      FROM total_stations t
      LEFT JOIN reported_stations r ON t.state_name = r.state_name
      LEFT JOIN valid_stations v ON t.state_name = v.state_name
      ORDER BY state_name;
    `;

    const result = await client.query(periodAggQuery, queryParams);
    return res.status(200).json({
      success: true,
      mode: "period",
      level: "state",
      startDate,
      endDate,
      data: result.rows,
    });
  } catch (error) {
    console.error("Error fetching state-level distribution data:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
