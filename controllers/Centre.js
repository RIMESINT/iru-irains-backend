
const express = require("express");
const router = express.Router();
const app = express();
const client = require("../connection");
const moment = require('moment');

exports.getCenterDetails = async (req, res) => {
    try {

        const centreType = req.query.centre_type;

        const query = `
                        SELECT 
                            ndd.region_code, 
                            sd.centre_type, 
                            sd.centre_name, 
                            sd.station_code, 
                            sd.district_code, 
                            ndd.subdiv_code
                        FROM 
                            station_details AS sd
                        JOIN
                            normal_district_details AS ndd
                        ON 
                            sd.district_code = CAST(ndd.district_code AS VARCHAR)
                        and
                            sd.centre_type = $1
                        GROUP BY
                            ndd.region_code,
                            sd.centre_type, 
                            sd.centre_name, 
                            sd.station_code, 
                            sd.district_code, 
                            ndd.subdiv_code
                        ORDER BY
                            region_code`;
        
        const result = await client.query(query, [centreType]);

        res.status(200).json({
            success: true,
            message: "Centre details fetched Successfully",
            data: result?.rows,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch Centre details",
            error: error.message,
        });
    }
}