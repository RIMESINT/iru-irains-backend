
const express = require("express");
const router = express.Router();
const app = express();
const client = require("../connection");
const transformData = require("../utils/transformDataNormalRegion");

// Function to create table if it doesn't exist
async function createTableIfNotExists() {
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS normal_region (
            id SERIAL PRIMARY KEY,
            date DATE NOT NULL,
            region_name VARCHAR(255) NOT NULL,
            region_id INTEGER NOT NULL,
            cumulative_rainfall_value NUMERIC(10, 2) NOT NULL
        );
    `;

    try {
        await client.query(createTableQuery);
    } catch (error) {
        console.error("Failed to create table", error);
        throw error;
    }
}

// Function to insert transformed data into the PostgreSQL table
async function insertTransformedData(transformedData) {

    await createTableIfNotExists();

    // Truncate table if already filled
    await client.query(" TRUNCATE TABLE  public.normal_region");

    const insertQuery = `
        INSERT INTO normal_region (date, region_name, region_id, cumulative_rainfall_value)
        VALUES ($1, $2, $3, $4)
        RETURNING id;
    `;

    for (let record of transformedData) {
        const values = [
            record.date,
            record.region,
            record.regionid,
            record.value
        ];

        try {
            await client.query(insertQuery, values);
        } catch (error) {
            console.error(`Failed to insert record: ${JSON.stringify(record)}`, error);
            throw error;
        }
    }
}

exports.getnRegionDataAndInsertInNormalRegion = async (req, res) => {
    try {

        const response = await client.query('SELECT * FROM nregion');

        const data = response?.rows;

        let transformedData = transformData(data);

        // Insert transformed data into the database
        await insertTransformedData(transformedData);

        res.status(200).json({  
                                success : true,
                                message :  "Data inserted successfully",
                            });
    } catch (error) {
        res.status(500).json({
                                succes:false, 
                                error : "Internal server error",
                                message : error.message,
                            });
    }
}