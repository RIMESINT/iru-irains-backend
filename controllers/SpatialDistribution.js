const client = require("../connection");
const moment = require("moment");

// exports.getSpatialDistributionData = async (req, res) => {
//   try {
//     // You can take date from query params, fallback to current date
//     const { date } = req.query;
//     const collectionDate = date || moment().format("YYYY-MM-DD");

//     const query = `
//       WITH total_stations AS (
//           SELECT 
//               n.subdiv_name,
//               MIN(n.id) AS id,  
//               COUNT(s.station_code) AS total_stations
//           FROM 
//               normal_district_details n
//           LEFT JOIN 
//               station_details s 
//               ON n.district_code = s.district_code
//           GROUP BY n.subdiv_name
//       ),
//       reported_stations AS (
//           SELECT 
//               n.subdiv_name,
//               COUNT(DISTINCT d.station_id) AS station_reported_rainfall
//           FROM 
//               normal_district_details n
//           JOIN 
//               station_daily_data d 
//               ON n.district_code = d.district_code
//           WHERE 
//               d.collection_date = $1
//               AND d.data >= 0.1
//           GROUP BY n.subdiv_name
//       ),
//       valid_stations AS (
//           SELECT 
//               n.subdiv_name,
//               COUNT(DISTINCT d.station_id) AS valid_stations
//           FROM 
//               normal_district_details n
//           JOIN 
//               station_daily_data d 
//               ON n.district_code = d.district_code
//           WHERE 
//               d.collection_date = $1
//           GROUP BY n.subdiv_name
//       )
//       SELECT 
//           t.id,
//           t.subdiv_name AS subdivision_name,
//           t.total_stations,
//           COALESCE(v.valid_stations, 0) AS valid_stations,
//           COALESCE(r.station_reported_rainfall, 0) AS station_reported_rainfall,
//           CASE 
//               WHEN COALESCE(v.valid_stations, 0) = 0 THEN NULL
//               ELSE ROUND((COALESCE(r.station_reported_rainfall, 0)::decimal / v.valid_stations) * 100, 2)
//           END AS percentage,
//           CASE
//               WHEN COALESCE(v.valid_stations, 0) = 0 THEN NULL
//               WHEN (COALESCE(r.station_reported_rainfall, 0)::decimal / v.valid_stations) * 100 <= 25 THEN 'Isolated'
//               WHEN (COALESCE(r.station_reported_rainfall, 0)::decimal / v.valid_stations) * 100 <= 50 THEN 'Scattered'
//               WHEN (COALESCE(r.station_reported_rainfall, 0)::decimal / v.valid_stations) * 100 <= 75 THEN 'Fairly Widespread'
//               ELSE 'Widespread'
//           END AS category
//       FROM 
//           total_stations t
//       LEFT JOIN 
//           reported_stations r ON t.subdiv_name = r.subdiv_name
//       LEFT JOIN 
//           valid_stations v ON t.subdiv_name = v.subdiv_name
//       ORDER BY subdivision_name;
//     `;

//     const result = await client.query(query, [collectionDate]);

//     return res.status(200).json({
//       success: true,
//       date: collectionDate,
//       data: result.rows,
//     });
//   } catch (error) {
//     console.error("Error fetching spatial distribution data:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Internal Server Error",
//     });
//   }
// };


//Old code above for a single date 


// below is for period code
exports.getSpatialDistributionData = async (req, res) => {
  try {
    const { date, startDate, endDate } = req.query;

    let queryParams;
    let dateCondition;

    if (startDate && endDate) {
      // Period mode
      queryParams = [startDate, endDate];
      dateCondition = `d.collection_date BETWEEN $1 AND $2`;
    } else {
      // Single day mode
      const collectionDate =
        date || moment().subtract(1, "days").format("YYYY-MM-DD");
      queryParams = [collectionDate];
      dateCondition = `d.collection_date = $1`;
    }

    const query = `
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
            WHERE ${dateCondition} AND d.data >= 0.1
            GROUP BY n.subdiv_name
        ),
        valid_stations AS (
            SELECT n.subdiv_name, COUNT(DISTINCT d.station_id) AS valid_stations
            FROM normal_district_details n
            JOIN station_daily_data d ON n.district_code = d.district_code
            WHERE ${dateCondition}
            GROUP BY n.subdiv_name
        )
        SELECT 
            t.id,
            t.subdiv_name AS subdivision_name,
            t.total_stations,
            COALESCE(v.valid_stations,0) AS valid_stations,
            COALESCE(r.station_reported_rainfall,0) AS station_reported_rainfall,
            CASE 
                WHEN COALESCE(v.valid_stations,0)=0 THEN NULL
                ELSE ROUND((COALESCE(r.station_reported_rainfall,0)::decimal/v.valid_stations)*100,2)
            END AS percentage,
            CASE
                WHEN COALESCE(v.valid_stations,0)=0 THEN NULL
                WHEN (COALESCE(r.station_reported_rainfall,0)::decimal/v.valid_stations)*100 <= 25 THEN 'Isolated'
                WHEN (COALESCE(r.station_reported_rainfall,0)::decimal/v.valid_stations)*100 <= 50 THEN 'Scattered'
                WHEN (COALESCE(r.station_reported_rainfall,0)::decimal/v.valid_stations)*100 <= 75 THEN 'Fairly Widespread'
                ELSE 'Widespread'
            END AS category
        FROM total_stations t
        LEFT JOIN reported_stations r ON t.subdiv_name = r.subdiv_name
        LEFT JOIN valid_stations v ON t.subdiv_name = v.subdiv_name
        ORDER BY subdivision_name;
      `;

    const result = await client.query(query, queryParams);

    return res.status(200).json({
      success: true,
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
  