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
        sum(normal_rainfall) as normal_rainfall,
        sum(actual_rainfall) as actual_rainfall,
        CASE 
          WHEN sum(normal_rainfall) IS NULL THEN NULL
          ELSE 
            ((sum(actual_rainfall) - sum(CASE WHEN normal_rainfall = 0 THEN 0.01 ELSE normal_rainfall END)) 
            / sum(CASE WHEN normal_rainfall = 0 THEN 0.01 ELSE normal_rainfall END)) * 100
        END as departure
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
    
            -- normal_rainfall from normal_block, LEFT JOIN: may be NULL
            avg(nb.rainfall_value) as normal_rainfall,
    
            -- actual_rainfall from station_daily_data
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
            ON sd.station_code = sdd.station_id
            AND sdd.collection_date BETWEEN $1 AND $2
            ${additionalCondition}
    
        -- NOTE: LEFT JOIN normal_block so it doesn’t filter missing normals
        LEFT JOIN 
            public.normal_block nb 
            ON sd.block_code = nb.block_id 
            AND nb.date = sdd.collection_date
    
        WHERE 
            sd.block_code IS NOT NULL
    
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
    



    try {
        const result = await client.query(query, [startDate, endDate]);
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




exports.fetchBlockRainfallAnalysis = async (req, res) => {
    try {
        let { startDate, endDate } = req.body;

        // Use current date if no dates are provided
        const currentDate = moment().format("YYYY-MM-DD");
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

        // Fetch block data
        const blockData = await fetchBetweenDates(startDate, endDate, currentDate, specificDateTime);

        // Categorize blocks based on legend criteria
        const legendCriteria = [
            { category: "Large Excess", min: 60, max: Infinity, color: "#0096ff" },
            { category: "Excess", min: 20, max: 59, color: "#32c0f8" },
            { category: "Normal", min: -19, max: 19, color: "#00cd5b" },
            { category: "Deficient", min: -59, max: -20, color: "#ff2700" },
            { category: "Large Deficient", min: -99, max: -60, color: "#ffff20" },
            { category: "No Rain", min: -100, max: -100, color: "#ffffff" },
            { category: "No Data", min: null, max: null, color: "#c0c0c0" },
        ];

        const categoryCounts = {
            "Large Excess": 0,
            Excess: 0,
            Normal: 0,
            Deficient: 0,
            "Large Deficient": 0,
            "No Rain": 0,
            "No Data": 0,
        };

        blockData.forEach((block) => {
            if (block.departure === null) {
                categoryCounts["No Data"]++;
            } else if (block.departure === -100) {
                categoryCounts["No Rain"]++;
            } else {
                const category = legendCriteria.find(
                    (c) =>
                        c.min !== null &&
                        c.max !== null &&
                        block.departure >= c.min &&
                        block.departure <= c.max
                );
                if (category) {
                    categoryCounts[category.category]++;
                }
            }
        });

        // Find top and minimum actual and departure values
        const validBlocks = blockData.filter((block) => block.actual_rainfall !== null);
        const validDepartureBlocks = blockData.filter((block) => block.departure !== null);

        const topActual = validBlocks.length
            ? validBlocks.reduce((max, block) =>
                  block.actual_rainfall > (max.actual_rainfall || 0) ? block : max
              )
            : null;
        const minActual = validBlocks.length
            ? validBlocks.reduce((min, block) =>
                  block.actual_rainfall < (min.actual_rainfall || Infinity) ? block : min
              )
            : null;
        const topDeparture = validDepartureBlocks.length
            ? validDepartureBlocks.reduce((max, block) =>
                  block.departure > (max.departure || -Infinity) ? block : max
              )
            : null;
        const minDeparture = validDepartureBlocks.length
            ? validDepartureBlocks.reduce((min, block) =>
                  block.departure < (min.departure || Infinity) ? block : min
              )
            : null;

        // Regional statistics
        const regions = ["CENTRAL INDIA", "NORTH INDIA", "SOUTH INDIA", "EAST INDIA", "WEST INDIA"];
        const regionalStats = regions.map((region) => {
            const regionBlocks = blockData.filter((block) => block.region_name === region);
            const totalRainfall = regionBlocks.reduce(
                (sum, block) => sum + (block.actual_rainfall || 0),
                0
            );
            const validRegionBlocks = regionBlocks.filter((block) => block.departure !== null);
            const avgDeparture =
                validRegionBlocks.length
                    ? validRegionBlocks.reduce((sum, block) => sum + block.departure, 0) /
                      validRegionBlocks.length
                    : null;
            return {
                region,
                avgRainfall: regionBlocks.length
                    ? Number((totalRainfall / regionBlocks.length).toFixed(1))
                    : null,
                change: avgDeparture ? Number(avgDeparture.toFixed(1)) : null,
            };
        }).filter((stat) => stat.avgRainfall !== null);

        // State-level statistics
        const stateStats = [...new Set(blockData.map((block) => block.state_name))].map((state) => {
            const stateBlocks = blockData.filter((block) => block.state_name === state);
            const totalRainfall = stateBlocks.reduce(
                (sum, block) => sum + (block.actual_rainfall || 0),
                0
            );
            const validStateBlocks = stateBlocks.filter((block) => block.departure !== null);
            const avgDeparture =
                validStateBlocks.length
                    ? validStateBlocks.reduce((sum, block) => sum + block.departure, 0) /
                      validStateBlocks.length
                    : null;
            return {
                state,
                avgRainfall: stateBlocks.length
                    ? Number((totalRainfall / stateBlocks.length).toFixed(1))
                    : null,
                change: avgDeparture ? Number(avgDeparture.toFixed(1)) : null,
            };
        }).filter((stat) => stat.avgRainfall !== null);

        // Subdivision-level statistics
        const subdivStats = [...new Set(blockData.map((block) => block.sub_division_code))].map(
            (subdiv) => {
                const subdivBlocks = blockData.filter((block) => block.sub_division_code === subdiv);
                const totalRainfall = subdivBlocks.reduce(
                    (sum, block) => sum + (block.actual_rainfall || 0),
                    0
                );
                const validSubdivBlocks = subdivBlocks.filter((block) => block.departure !== null);
                const avgDeparture =
                    validSubdivBlocks.length
                        ? validSubdivBlocks.reduce((sum, block) => sum + block.departure, 0) /
                          validSubdivBlocks.length
                        : null;
                return {
                    subdivision: subdivBlocks[0]?.subdiv_name || `Subdivision ${subdiv}`,
                    avgRainfall: subdivBlocks.length
                        ? Number((totalRainfall / subdivBlocks.length).toFixed(1))
                        : null,
                    change: avgDeparture ? Number(avgDeparture.toFixed(1)) : null,
                };
            }
        ).filter((stat) => stat.avgRainfall !== null);

        // Summary statistics
        const totalRainfall = blockData.reduce((sum, block) => sum + (block.actual_rainfall || 0), 0);
        const validBlocksForDeparture = blockData.filter((block) => block.departure !== null);
        const avgDeparture =
            validBlocksForDeparture.length
                ? validBlocksForDeparture.reduce((sum, block) => sum + block.departure, 0) /
                  validBlocksForDeparture.length
                : null;
        const highestRainfallRegion = regionalStats.reduce(
            (max, stat) => (stat.avgRainfall > (max.avgRainfall || 0) ? stat : max),
            {}
        );
        const lowestRainfallRegion = regionalStats.reduce(
            (min, stat) => (stat.avgRainfall < (min.avgRainfall || Infinity) ? stat : min),
            {}
        );

        const summaryStats = {
            totalRainfall: Number(totalRainfall.toFixed(1)),
            highestRainfall: highestRainfallRegion.avgRainfall
                ? `${highestRainfallRegion.avgRainfall} mm (${highestRainfallRegion.region})`
                : "No Data",
            lowestRainfall: lowestRainfallRegion.avgRainfall
                ? `${lowestRainfallRegion.avgRainfall} mm (${lowestRainfallRegion.region})`
                : "No Data",
            averageDeparture: avgDeparture ? Number(avgDeparture.toFixed(1)) : null,
        };

        res.status(200).json({
            success: true,
            message: "Rainfall analysis fetched successfully",
            data: {
                categoryCounts,
                topActual: topActual || { message: "No valid actual rainfall data" },
                minActual: minActual || { message: "No valid actual rainfall data" },
                topDeparture: topDeparture || { message: "No valid departure data" },
                minDeparture: minDeparture || { message: "No valid departure data" },
                regionalStatistics: regionalStats,
                stateStatistics: stateStats,
                subdivisionStatistics: subdivStats,
                summaryStatistics: summaryStats,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch rainfall analysis",
            error: error.message,
        });
    }
};





exports.fetchBlockDataAforAPIexport = async (req, res) => {
    try {
        let { user, pass, fromDate, toDate } = req.body;

        // 🔐 Validate credentials
        if (user !== "CWC_DEP" || pass !== "!Md@15O#cwc") {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: Invalid credentials",
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

        // Ensure valid range
        if (moment(fromDate).isAfter(toDate)) {
            return res.status(400).json({
                success: false,
                message: "fromDate should be less than or equal to toDate",
            });
        }

        // Cutoff handling (if needed, same as your region logic)
        const specificTime = "07:50:15.744983+00";
        const specificDateTime = `${currentDate} ${specificTime}`;

        // 📌 Call block service
        let data = await fetchBetweenDates(fromDate, toDate, currentDate, specificDateTime);

        return res.status(200).json({
            success: true,
            message: "Block data fetched successfully",
            data: data,
        });

    } catch (error) {
        console.error("Error in fetchBlockDataAforAPIexport:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch Block data",
            error: error.message,
        });
    }
};


module.exports.fetchBetweenDates = fetchBetweenDates;
