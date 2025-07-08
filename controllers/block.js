const express = require("express");
const router = express.Router();
const app = express();
const client = require("../connection");
const moment = require('moment');


exports.fetchBlockData = async (req, res) => {
    try {
        let { startDate, endDate } = req.body;

        // Use current date if no dates are provided
        const currentDate = moment().format('YYYY-MM-DD');
        if (!startDate && !endDate) {
            startDate = endDate = currentDate;
        } else if (!startDate) {
            startDate = endDate;
        } else if (!endDate) {
            endDate = startDate;
        }

        // Ensure startDate is less than or equal to endDate
        if (moment(startDate).isAfter(endDate)) {
            return res.status(400).json({
                success: false,
                message: "startDate should be less than or equal to endDate",
            });
        }

        const specificTime = "07:50:15.744983+00";
        const specificDateTime = `${currentDate} ${specificTime}`;

        let data = await fetchBetweenDates(startDate, endDate, currentDate, specificDateTime);

        res.status(200).json({
            success: true,
            message: "District data fetched Successfully",
            data: data
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch District data",
            error: error.message,
        });
    }
}
const fetchBetweenDates = async (startDate, endDate, currentDate, specificDateTime) => {
    let additionalCondition = '';
    if (endDate === currentDate) {
        additionalCondition = ` AND sdd.updated_at < '${specificDateTime}'`;
    }

    const query = `
      SELECT 
            min(block_name) as block_name,
            block_code,
            min(district_name) as district_name,
            min(district_code) as district_code,
            min(state_name) as state_name,
            min(state_code) as state_code,
            min(region_name) as region_name,
            min(region_code) as region_code,
            min(centre_name) as centre_name,
            min(centre_type) as centre_type,
            min(sub_division_code) as sub_division_code,
            sum(actual_rainfall) as actual_rainfall
        FROM (
            SELECT 
                sd.block_name,
                sd.block_code,
                ndd.district_name,
                ndd.district_code,
                ndd.state_name,
                ndd.new_state_code as state_code,
                ndd.region_name,
                ndd.region_code,
                sd.centre_name,
                sd.centre_type,
                ndd.subdiv_code as sub_division_code,
                avg(
                    CASE 
                        WHEN sdd.data = '-999.9' THEN NULL 
                        ELSE sdd.data::FLOAT 
                    END
                ) as actual_rainfall
            FROM 
                public.station_details sd
            JOIN 
                public.normal_district_details ndd
                ON sd.district_code = ndd.district_code
            LEFT JOIN 
                public.station_daily_data sdd 
                ON sd.district_code = sdd.district_code
                AND sdd.collection_date BETWEEN $1 AND $2
                ${additionalCondition}
            GROUP BY 
                sd.block_code,
                sd.block_name,

                ndd.district_name,
                ndd.district_code,
                ndd.state_name,
                ndd.new_state_code,
                ndd.region_name,
                ndd.region_code,
                sd.centre_name,
                sd.centre_type,
                ndd.subdiv_code
        ) as test
        GROUP BY 
            block_code;
    `;

    console.log('Generated query:', query);
    console.log('Query parameters:', [startDate, endDate, specificDateTime]);

    try {
        const result = await client.query(query, [startDate, endDate]);
        console.log('Query result rows:', result.rows.length, result.rows);
        return result.rows;
    } catch (error) {
        console.error('Error executing query', error.stack);
        throw error;
    }
};

exports.getAllBlocks = async (req, res) => {
    try {
        const query = `
                        SELECT 
                            sd.block_name,
                            sd.block_code,
                            MIN(ndd.district_name) AS district_name,
                            MIN(ndd.district_code) AS district_code,
                            MIN(ndd.state_name) AS state_name,
                            MIN(ndd.new_state_code) AS state_code,
                            MIN(ndd.region_name) AS region_name,
                            MIN(ndd.region_code) AS region_code,
                            MIN(sd.centre_type) AS centre_type,
                            MIN(sd.centre_name) AS centre_name,
                            MIN(ndd.subdiv_name) AS subdiv_name,
                            MIN(ndd.subdiv_code) AS subdiv_code
                        FROM 
                            public.station_details AS sd
                        JOIN 
                            public.normal_district_details AS ndd 
                        ON 
                            ndd.district_code = sd.district_code
                        GROUP BY
                            sd.block_code,
                            sd.block_name
                        ORDER BY
                            sd.block_code;
                        `;
        
        const result = await client.query(query);

        res.status(200).json({
            success: true,
            message: "Block list fetched successfully",
            data: result?.rows,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch block list",
            error: error.message,
        });
    }
};