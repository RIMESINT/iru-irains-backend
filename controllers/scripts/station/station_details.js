const express = require("express");
const router = express.Router();
const app = express();
const client = require("../../../connection");

exports.createStationDetailsTable = async (req, res) => {
    try {
        // Create the station_details table
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS station_details (
                district_code VARCHAR,
                station_name VARCHAR,
                station_code BIGINT,
                station_type VARCHAR,
                station_type_old VARCHAR,
                centre_type VARCHAR,
                centre_name VARCHAR,
                is_new_station INTEGER,
                latitude DECIMAL,
                longitude DECIMAL,
                activationdate DATE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `;

        await client.query(createTableQuery);

        // Insert data into the station_details table
        const insertDataQuery = `
            INSERT INTO station_details (
                district_code, 
                station_name, 
                station_code, 
                station_type, 
                station_type_old, 
                centre_type, 
                centre_name, 
                is_new_station, 
                latitude, 
                longitude, 
                activationdate, 
                created_at, 
                updated_at
            )
            SELECT 
                ms.district_code, 
                ms.stationname, 
                ms.station_code, 
                ms.typeofdata AS station_type, 
                es.stationtype AS station_type_old,
                split_part(ms.rmc_mc, ' ', 1) AS centre_type, 
                split_part(ms.rmc_mc, ' ', 2) AS centre_name,
                CASE 
                    WHEN es.neworold = 'old' THEN 0
                    ELSE 1 
                END AS is_new_station,
                CAST(es.lat AS DECIMAL) AS latitude,
                CAST(es.lng AS DECIMAL) AS longitude,
                TO_DATE(es.activationdate, 'YYYY-MM-DD') AS activationdate,
                CURRENT_TIMESTAMP AS created_at,
                CURRENT_TIMESTAMP AS updated_at
            FROM 
                masterfile AS ms
            JOIN
                existingstationdata AS es
            ON ms.station_code = es.stationid;
        `;

        await client.query(insertDataQuery);

        res.status(200).json({ message: "Table created and data inserted successfully" });
    } catch (error) {
        console.error("Error creating table or inserting data:", error);
        res.status(500).json({ message: "Error creating table or inserting data", error: error.message });
    } finally {
        await client.end();
    }
};