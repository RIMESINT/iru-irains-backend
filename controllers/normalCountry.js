const express = require("express");
const router = express.Router();
const app = express();
const client = require("../connection");
const convertDate = require("../utils/convertDate");


exports.getnCountryDataAndInsertInNormalCountry = async(req, res) => {
    try {
        const result = await client.query('SELECT * FROM ncountry ');
        if (result.rows.length === 0) {
            res.status(404).json({ success: false, error: 'File not found' });
            return;
        }
        const data = result.rows[0]
        let prev = 0;
        var insert_query = "INSERT INTO normal_country (date, country_name, cumulative_rainfall_value, rainfall_value) VALUES ";
        for (const key in data) {
            if (data.hasOwnProperty(key) && key !== 'country_as_whole') {
                const { month, day, year } = convertDate(key);
                if ((day == 1) && (month == 1 || month == 3 || month == 6 || month == 10)) {
                    prev = 0
                }
                insert_query += `(  '${year}-${month}-${day}', 'INDIA', ${data[key]}, ${data[key]-prev}),`;
                prev = data[key]

            }
        }
        insert_query = insert_query.slice(0, -1);
        await client.query("CREATE TABLE IF NOT EXISTS public.normal_country ( id SERIAL PRIMARY KEY, date DATE NOT NULL, country_name VARCHAR(255) NOT NULL, cumulative_rainfall_value NUMERIC(10, 2) NOT NULL, rainfall_value NUMERIC(10, 2) NOT NULL )");
        await client.query(" TRUNCATE TABLE  public.normal_country");
        await client.query(insert_query);
        res.status(200).json({ message: "Data Inserted Successfully" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
}