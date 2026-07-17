const moment = require("moment");
const client = require("../connection");

const BASIN_API_USER = "BASIN_DEP";
const BASIN_API_PASS = "!Bsn@26R#hyd";

exports.fetchBasinStationRainfallDataAPIexport = async (req, res) => {
    try {
        let { user, pass, fromDate, toDate } = req.body;

        // 🔐 Validate credentials
        if (user !== BASIN_API_USER || pass !== BASIN_API_PASS) {
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
            message: "Basin station rainfall data fetched successfully",
            fromDate: fromDate,
            toDate: toDate,
            data: data
        });

    } catch (error) {
        console.error("Error in fetchBasinStationRainfallDataAPIexport:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch basin station rainfall data",
            error: error.message
        });
    }
};

const fetchBetweenDates = async (fromDate, toDate) => {
    const query = `
        SELECT
            bs.id AS station_id,
            bs.station_name,
            bs.basin,
            bs.sub_basin,
            bs.district,
            bs.state,
            bs.source_agency,
            bs.latitude,
            bs.longitude,
            TO_CHAR(bsr.rainfall_date, 'YYYY-MM-DD') AS rainfall_date,
            bsr.rainfall_mm,
            bsr.reading_status
        FROM public.basin_station_daily_rainfall bsr
        JOIN public.basin_stations bs ON bs.id = bsr.station_id
        WHERE bsr.rainfall_date BETWEEN $1 AND $2
        ORDER BY bs.basin, bs.station_name, bsr.rainfall_date;
    `;

    const result = await client.query(query, [fromDate, toDate]);
    return result.rows;
};
