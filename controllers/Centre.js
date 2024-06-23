
const express = require("express");
const router = express.Router();
const app = express();
const client = require("../connection");
const moment = require('moment');

exports.getCenterDetails = async (req, res) => {
    try {

        const centreType = req.body.centre_type;

        const query = `
                        SELECT 
                            ndd.region_code, 
                            sd.centre_type, 
                            sd.centre_name
                        FROM 
                            station_details AS sd
                        JOIN
                            normal_district_details AS ndd
                        ON 
                            sd.district_code = ndd.district_code 
                        and
                            sd.centre_type = $1
                        GROUP BY
                            sd.centre_type, 
                            sd.centre_name, 
                            ndd.region_code
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