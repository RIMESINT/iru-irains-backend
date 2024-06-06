
const express = require("express");
const router = express.Router();
const app = express();
const client = require("../connection");
const transformDataNormalDistrict = require("../utils/transformDataNormalDistrict");

// Function to create table if it doesn't exist
async function createTableIfNotExists() {
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS public.normal_district (
            id SERIAL PRIMARY KEY,
            region_name VARCHAR(255) COLLATE pg_catalog."default",
            region_code INTEGER,
            subdiv_name VARCHAR(255) COLLATE pg_catalog."default",
            sd INTEGER,
            subdiv_code INTEGER,
            state_name VARCHAR(255) COLLATE pg_catalog."default",
            rst INTEGER,
            state_code INTEGER,
            district_name VARCHAR(255) COLLATE pg_catalog."default",
            ddd INTEGER,
            district_code INTEGER,
            date DATE,
            cumulative_rainfall_value DOUBLE PRECISION
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
    // Ensure the table exists
    await createTableIfNotExists();

    // Truncate table if it already contains data
    await client.query("TRUNCATE TABLE public.normal_district");

    const insertQuery = `
        INSERT INTO public.normal_district (date, region_name, region_code, subdiv_name, sd, subdiv_code, state_name, rst, state_code, district_name, ddd, district_code, rainfall_value)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING id;
    `;

    for (let record of transformedData) {
        const values = [
            record.date,
            record.region_name,
            record.region_code,
            record.subdiv_name,
            record.sd,
            record.subdiv_code,
            record.state_name,
            record.rst,
            record.state_code,
            record.district_name,
            record.ddd,
            record.district_code,
            record.rainfall_value
        ];

        try {
            const result = await client.query(insertQuery, values);
            console.log(`Inserted record with id ${result.rows[0].id}`);
        } catch (error) {
            console.error(`Failed to insert record: ${JSON.stringify(record)}`, error);
            throw error;
        }
    }
}

exports.getnDistrictDataAndInsertInNormalDistrict = async (req, res) => {
    try {

        const response = await client.query('SELECT * FROM nDistrict');

        const data = response?.rows;

        let transformedData = transformDataNormalDistrict(data);

        // Insert transformed data into the database
        // await insertTransformedData(transformedData);

        res.status(200).json({  
                                success : true,
                                message :  transformedData,
                            });
    } catch (error) {
        res.status(500).json({
                                succes:false, 
                                error : "Internal server error",
                                message : error.message,
                            });
    }
}