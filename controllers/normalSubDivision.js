
const express = require("express");
const router = express.Router();
const app = express();
const client = require("../connection");
const transformDataNormalSubDivision = require("../utils/transformDataNormalSubDivison");

// Function to create table if it doesn't exist
async function createTableIfNotExists() {
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS normal_sub_division (
            id SERIAL PRIMARY KEY,
            date DATE NOT NULL,
            sub_division_name VARCHAR(255) NOT NULL,
            sub_division_id INTEGER NOT NULL,
            sub_division_code INTEGER NOT NULL,
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
    await client.query("TRUNCATE TABLE public.normal_sub_division");

    const insertQuery = `
        INSERT INTO normal_sub_division (date, sub_division_name, sub_division_id, sub_division_code, cumulative_rainfall_value)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id;
    `;

    for (let record of transformedData) {
        const values = [
            record.date,
            record.subdivision_name,
            record.subdivision_id,
            record.subdivision_code,
            record.rainfall_value
        ];

        try {
            await client.query(insertQuery, values);
        } catch (error) {
            console.error(`Failed to insert record: ${JSON.stringify(record)}`, error);
            throw error;
        }
    }
}

exports.getnSubDivisionDataAndInsertInNormalSubDivision = async (req, res) => {
    try {

        const response = await client.query('SELECT * FROM nsubdivision');

        const data = response?.rows;

        let transformedData = transformDataNormalSubDivision(data);

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