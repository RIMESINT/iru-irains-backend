const client = require("../connection");
const moment = require("moment");

// GET /api/v1/top-rainfall-stations?days=5&topN=100
// For each date in the last `days` days (including today), returns the top
// `topN` stations by rainfall value for that date.
exports.getTopRainfallStations = async (req, res) => {
    try {
        let days = parseInt(req.query.days) || 30;
        let topN = parseInt(req.query.topN) || 100;
        days = Math.min(Math.max(days, 1), 90);
        topN = Math.min(Math.max(topN, 1), 500);

        const toDate = moment().format("YYYY-MM-DD");
        const fromDate = moment().subtract(days - 1, "days").format("YYYY-MM-DD");

        const query = `
            SELECT collection_date, station_code, station_name, centre_name,
                   district_name, state_name, rainfall
            FROM (
                SELECT
                    TO_CHAR(sdd.collection_date, 'YYYY-MM-DD') AS collection_date,
                    sd.station_code,
                    sd.station_name,
                    sd.centre_name,
                    ndd.district_name,
                    ndd.state_name,
                    sdd.data AS rainfall,
                    ROW_NUMBER() OVER (PARTITION BY sdd.collection_date ORDER BY sdd.data DESC) AS rn
                FROM public.station_daily_data_updates sdd
                JOIN public.station_details sd ON sd.station_code = sdd.station_id
                LEFT JOIN public.normal_district_details ndd ON ndd.district_code = sdd.district_code
                WHERE sdd.collection_date BETWEEN $1 AND $2
                    AND sdd.data != -999.9
                    AND sd.flag != 0
            ) ranked
            WHERE rn <= $3
            ORDER BY collection_date DESC, rainfall DESC;
        `;

        const result = await client.query(query, [fromDate, toDate, topN]);

        res.status(200).json({
            success: true,
            fromDate,
            toDate,
            topN,
            data: result.rows,
        });
    } catch (error) {
        console.error("[TOP RAINFALL STATIONS] getTopRainfallStations:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
