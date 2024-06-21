const express = require("express");
const router = express.Router();
const app = express();
const client = require("../../../connection");
const transformData = require("../../../utils/transformDataNormalRegion");

// Function to create table if it doesn't exist
async function createTableIfNotExists() {
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS normal_region (
            id SERIAL PRIMARY KEY,
            date DATE NOT NULL,
            region_name VARCHAR(255) NOT NULL,
            region_id INTEGER NOT NULL,
            cumulative_rainfall_value NUMERIC(10, 2) NOT NULL,
            rainfall_value NUMERIC(10, 2) NOT NULL
        );
    `;

    try {
        await client.query(createTableQuery);
    } catch (error) {
        console.error("Failed to create table", error);
        throw error;
    }
}

async function insertTransformedData(transformedData) {
    await createTableIfNotExists();

    // Truncate table if already filled
    await client.query("TRUNCATE TABLE public.normal_region");

    if (transformedData.length === 0) {
        return;
    }

    const insertQueryBase = `
        INSERT INTO normal_region (date, region_name, region_id, cumulative_rainfall_value, rainfall_value)
        VALUES 
    `;

    const values = [];
    const valuePlaceholders = transformedData.map((record, index) => {
        const baseIndex = index * 5;
        values.push(record.date, record.region, record.regionid, record.value, record.rainfall_value);
        return `($${baseIndex + 1}, $${baseIndex + 2}, $${baseIndex + 3}, $${baseIndex + 4}, $${baseIndex + 5})`;
    });

    const insertQuery = insertQueryBase + valuePlaceholders.join(', ');

    try {
        await client.query(insertQuery, values);
    } catch (error) {
        console.error("Failed to insert records", error);
        throw error;
    }
}


exports.getnRegionDataAndInsertInNormalRegion = async(req, res) => {
    try {

        const response = await client.query('SELECT * FROM nregion');

        const data = response?.rows;

        let transformedData = transformData(data);

        // Insert transformed data into the database
        await insertTransformedData(transformedData);

        res.status(200).json({
            success: true,
            message: "Data inserted successfully",
        });
    } catch (error) {
        res.status(500).json({
            succes: false,
            error: "Internal server error",
            message: error.message,
        });
    }
}