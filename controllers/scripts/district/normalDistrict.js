
const express = require("express");
const router = express.Router();
const app = express();
const client = require("../../../connection");
const convertDate = require("../../../utils/convertDate");



exports.getnDistrictDataAndInsertInNormalDistrict = async (req, res) => {
    try {
        const result = await client.query('SELECT * FROM ndistrict ');
        if (result.rows.length === 0) {
            res.status(404).json({ success: false, error: 'File not found' });
            return;
        }
        await client.query(`
          CREATE TABLE IF NOT EXISTS public.normal_district_details (
              id SERIAL PRIMARY KEY,
              region_name VARCHAR(255) NOT NULL,
              region_code BIGINT NOT NULL,
              subdiv_name VARCHAR(255) NOT NULL,
              sd INT NOT NULL,
              subdiv_code BIGINT NOT NULL,
              state_name VARCHAR(255) NOT NULL,
              rst INT NOT NULL,
              state_code BIGINT NOT NULL,
              district_name VARCHAR(255) NOT NULL,
              ddd INT NOT NULL,
              district_code BIGINT NOT NULL
          )
      `);
        await client.query(`
          CREATE TABLE IF NOT EXISTS public.normal_district (
              id SERIAL PRIMARY KEY,
              date DATE NOT NULL,
              cumulative_rainfall_value NUMERIC(10, 2) NOT NULL,
              rainfall_value NUMERIC(10, 2) NOT NULL,
              normal_district_details_id INT,
              FOREIGN KEY (normal_district_details_id) REFERENCES public.normal_district_details(id)
          )
      `);
        await client.query("TRUNCATE TABLE public.normal_district CASCADE");
        await client.query("TRUNCATE TABLE public.normal_district_details CASCADE");

        result.rows.forEach(async(data) => {
            const region_name = data['region_name']
            const region_code = data['region_code']
            const subdiv_name = data['subdiv_name']
            const sd = data['sd']
            const subdiv_code = data['subdiv_code']
            const state_name = data['state_name']
            const rst = data['rst']
            const state_code = data['state_code']
            const district_name = data['district_name']
            const ddd = data['ddd']
            const district_code = data['district_code']

            const detail_result = await client.query("INSERT INTO normal_district_details (region_name,	region_code,	subdiv_name,	sd,	subdiv_code,	state_name,	rst,	state_code,	district_name,	ddd,	district_code) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id", [region_name, region_code, subdiv_name, sd, subdiv_code, state_name, rst, state_code, district_name, ddd, district_code]);
            const detail_result_id = detail_result.rows[0].id
            let prev = 0
            let insert_query = "INSERT INTO normal_district (date, cumulative_rainfall_value, rainfall_value, normal_district_details_id) VALUES "
            for (const key in data) {
                if (data.hasOwnProperty(key) && key !== 'region_name' && key !== 'region_code' && key !== 'subdiv_name' && key !== 'sd' && key !== 'subdiv_code' && key !== 'state_name' && key !== 'rst' && key !== 'state_code' && key !== 'district_name' && key !== 'ddd' && key !== 'district_code') {
                    const { month, date, year,day } = convertDate(key);
                    if ((day == 1) && (month == 1 || month == 3 || month == 6 || month == 10)) {
                        prev = 0
                    }
                    insert_query += `('${date}', ${data[key]}, ${data[key] - prev}, ${detail_result_id}),`
                    prev = data[key]
                }
            }
            insert_query = insert_query.slice(0, -1);
            await client.query(insert_query);
        });
        res.status(200).json({ message: "District Normal Migrated Successfully" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
}