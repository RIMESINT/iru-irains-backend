const express = require("express");
const router = express.Router();
const app = express();
const client = require("../../../connection");
const convertDate = require("../../../utils/convertDate");




exports.getnStateDataAndInsertInNormalState = async(req, res) => {
    try {
        const result = await client.query('SELECT * FROM nstate ');
        if (result.rows.length === 0) {
            res.status(404).json({ success: false, error: 'File not found' });
            return;
        }
        var insert_query = "INSERT INTO normal_state (date, state_name, state_code, cumulative_rainfall_value, rainfall_value) VALUES ";
        result.rows.forEach(data => {
            const state_name = data['statename']
            const state_code = data['state_code']
            let prev = 0;
            for (const key in data) {
                if (data.hasOwnProperty(key) && key !== 'statename' && key !== 'state_code') {
                    const { month, date, day, year } = convertDate(key);
                    if ((day == 1) && (month == 1 || month == 3 || month == 6 || month == 10)) {
                        prev = 0
                    }
                    insert_query += `(  '${date}', '${state_name}', ${state_code}, ${data[key]}, ${data[key] - prev}),`;
                    prev = data[key]
                }
            }
        });
        insert_query = insert_query.slice(0, -1);
        await client.query("CREATE TABLE IF NOT EXISTS public.normal_state ( id SERIAL PRIMARY KEY, date DATE NOT NULL, state_name VARCHAR(255) NOT NULL,  state_code integer NOT NULL, cumulative_rainfall_value NUMERIC(10, 2) NOT NULL, rainfall_value NUMERIC(10, 2) NOT NULL )");
        await client.query(" TRUNCATE TABLE  public.normal_state");
        await client.query(insert_query);
        res.status(200).json({ message: insert_query });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }

}