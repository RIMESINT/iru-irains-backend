const client = require("../../../connection");

exports.getAllAwsStations = async (req, res) => {
    try {
        const query = `
            SELECT
                station_code,
                station_name,
                block_code,
                block_name,
                district_code
            FROM public.aws_station_details
            ORDER BY station_name
        `;
        const result = await client.query(query);
        res.status(200).json({
            success: true,
            message: "AWS station list fetched successfully",
            data:    result?.rows
        });
    } catch (error) {
        console.error('getAllAwsStations error:', error);
        res.status(500).json({ success: false, message: "Failed to fetch AWS station list" });
    }
};

exports.getAllStations = async (req, res) => {
    try {
        const query = `
            SELECT
                station_code,
                station_name,
                block_code,
                block_name,
                district_code
            FROM public.station_details
            ORDER BY station_name
        `;
        const result = await client.query(query);
        res.status(200).json({
            success: true,
            message: "Station list fetched successfully",
            data:    result?.rows
        });
    } catch (error) {
        console.error('getAllStations error:', error);
        res.status(500).json({ success: false, message: "Failed to fetch station list" });
    }
};