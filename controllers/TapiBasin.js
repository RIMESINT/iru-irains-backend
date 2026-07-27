const moment = require("moment");
const client = require("../connection");

const TAPI_BASIN_API_USER = "BASIN_DEP";
const TAPI_BASIN_API_PASS = "!Bsn@26R#hyd";

exports.fetchTapiBasinRainfallDataAPIexport = async (req, res) => {
    try {
        let { user, pass, fromDate, toDate } = req.body;

        // 🔐 Validate credentials
        if (user !== TAPI_BASIN_API_USER || pass !== TAPI_BASIN_API_PASS) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: Invalid credentials"
            });
        }

        // ✅ Handle dates
        const currentDate = moment().format("YYYY-MM-DD");
        if (!fromDate && !toDate) {
            fromDate = toDate = currentDate;
        } else if (!fromDate) {
            fromDate = toDate;
        } else if (!toDate) {
            toDate = fromDate;
        }

        // Check if start <= end
        if (moment(fromDate).isAfter(toDate)) {
            return res.status(400).json({
                success: false,
                message: "fromDate should be less than or equal to toDate"
            });
        }

        const data = await fetchBetweenDates(fromDate, toDate);

        return res.status(200).json({
            success: true,
            message: "Tapi basin station rainfall data fetched successfully",
            fromDate: fromDate,
            toDate: toDate,
            data: data
        });

    } catch (error) {
        console.error("Error in fetchTapiBasinRainfallDataAPIexport:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch Tapi basin station rainfall data",
            error: error.message
        });
    }
};

// Every station in tapi_basin_api_request is either a conventional station
// (found in river_basin_details / station_details / station_daily_data) or an
// AWS station (found in aws_river_basin_details / aws_station_details /
// aws_station_daily_data). Every requested station is always returned, even
// when no basin/rainfall match is found — those fields just come back null.
const fetchBetweenDates = async (fromDate, toDate) => {
    const query = `
        WITH resolved AS (
            SELECT
                t.station_code,
                t.station_name,
                t.district AS request_district,
                rbd.basin,
                rbd.subbasin,
                'conventional' AS source_type
            FROM public.tapi_basin_api_request t
            JOIN public.river_basin_details rbd ON rbd.station_code = t.station_code

            UNION ALL

            SELECT
                t.station_code,
                t.station_name,
                t.district AS request_district,
                arbd.basin,
                arbd.subbasin,
                'aws' AS source_type
            FROM public.tapi_basin_api_request t
            JOIN public.aws_river_basin_details arbd ON arbd.station_code = t.station_code
            WHERE NOT EXISTS (
                SELECT 1 FROM public.river_basin_details rbd2 WHERE rbd2.station_code = t.station_code
            )

            UNION ALL

            SELECT
                t.station_code,
                t.station_name,
                t.district AS request_district,
                NULL::varchar AS basin,
                NULL::varchar AS subbasin,
                'unresolved' AS source_type
            FROM public.tapi_basin_api_request t
            WHERE NOT EXISTS (
                SELECT 1 FROM public.river_basin_details rbd WHERE rbd.station_code = t.station_code
            )
            AND NOT EXISTS (
                SELECT 1 FROM public.aws_river_basin_details arbd WHERE arbd.station_code = t.station_code
            )
        ),
        station_meta AS (
            SELECT
                sm.station_code,
                sm.station_name,
                sm.request_district,
                sm.basin,
                sm.subbasin,
                sm.source_type,
                COALESCE(sd.longitude, asd.longitude) AS longitude,
                COALESCE(sd.latitude, asd.latitude) AS latitude,
                COALESCE(sd.district_code, asd.district_code) AS district_code
            FROM resolved sm
            LEFT JOIN public.station_details sd
                ON sm.source_type = 'conventional' AND sd.station_code::text = sm.station_code
            LEFT JOIN public.aws_station_details asd
                ON sm.source_type = 'aws' AND asd.station_code::text = sm.station_code
        )
        SELECT
            sm.basin,
            sm.subbasin AS sub_basin,
            sm.station_name,
            sm.longitude,
            sm.latitude,
            COALESCE(ndd.district_name, sm.request_district) AS district,
            ndd.state_name AS state,
            TO_CHAR(COALESCE(daily.collection_date, aws_daily.collection_date), 'YYYY-MM-DD') AS rainfall_date,
            COALESCE(daily.data, aws_daily.data) AS rainfall_mm
        FROM station_meta sm
        LEFT JOIN public.normal_district_details ndd
            ON ndd.district_code = sm.district_code
        LEFT JOIN public.station_daily_data daily
            ON sm.source_type = 'conventional'
            AND daily.station_id::text = sm.station_code
            AND daily.collection_date BETWEEN $1 AND $2
        LEFT JOIN public.aws_station_daily_data aws_daily
            ON sm.source_type = 'aws'
            AND aws_daily.station_id::text = sm.station_code
            AND aws_daily.collection_date BETWEEN $1 AND $2
        ORDER BY sm.basin NULLS LAST, sm.subbasin NULLS LAST, sm.station_name, rainfall_date;
    `;

    const result = await client.query(query, [fromDate, toDate]);
    return result.rows;
};
