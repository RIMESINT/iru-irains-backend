const sendEmail  = require("../configEmail");
const client = require("../connection");
// const moment = require('moment');


exports.testMail = async (req, res) => {
    try {
        // const { to, subject, text, attachments,html } = req.body;
        sendEmail({to:"ghanshyampal789@gmail.com",subject:"Test mail",html:"<h1>test Msil</h1>"})

        res.status(200).json({
            success: true,
            message: "Email Sent Successfully",
            // data: data
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to send Email",
            error: error.message,
        });
    }
}


exports.dailyDataUpdateReminder = async (req, res) => {
    try {
        dailyDataUpdateReminderQuery()

        res.status(200).json({
            success: true,
            message: "Email Sent Successfully",
            // data: data
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to send Email",
            error: error.message,
        });
    }
}


exports.dailyDataVerificationReminder = async (req, res) => {
    try {
        dailyDataVerificationReminderQuery()

        res.status(200).json({
            success: true,
            message: "Email Sent Successfully",
            // data: data
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to send Email",
            error: error.message,
        });
    }
}




dailyDataUpdateReminderQuery = async (req, res) => {
    try {

        const allEmail = `SELECT distinct username FROM public.login limit 2`;

        const query = `WITH matched_stations AS (
                        SELECT 
                            sd.station_name,
                            sd.station_code,
                            l.username
                        FROM 
                            public.station_details AS sd
                        JOIN 
                            public.login AS l 
                        ON LOWER(l.name) = LOWER(sd.centre_type || ' ' || sd.centre_name)
                        WHERE 
                            sd.station_code IN (
                                SELECT 
                                    station_id 
                                FROM 
                                    public.station_daily_data 
                                WHERE 
                                    collection_date = CURRENT_DATE 
                                    AND (data IS NULL OR data = -999.9)
                            )
                    )
                    , grouped_stations AS (
                        SELECT 
                            station_code, 
                            MIN(station_name) AS station_name, 
                            MIN(username) AS username
                        FROM 
                            matched_stations
                        GROUP BY 
                            station_code
                    )
                    SELECT *
                    FROM 
                        grouped_stations
                    WHERE 
                        username = $1
                    ORDER BY 
                        username, 
                        station_name;`;

        const result = await client.query(allEmail);
         result.rows.map(async item => {
            const result1 = await client.query(query,[item.username]);
            if(result1.rows[0]){
                let trows = `<table border='1'> 
                                <thead>
                                <tr>
                                    <th>Station Name</th>
                                    <th>Station Id</th>
                                </tr>
                                </thead>
                                <tbody>`
                result1.rows.map(data =>{
                    trows+=`<tr><td>${data.station_name}</td><td>${data.station_code}</td></tr>`
                })
                trows+=`</tbody>
                        </table>`

                sendEmail({to:"ghanshyampal789@gmail.com",subject:item.username,html:trows})  
                console.log(trows);
            }
            
         })


        return {success:true,message:"query fatched successfully"}
    } catch (error) {
        console.error(error);
        return {success:false,message:error.message}
    }
}



dailyDataVerificationReminderQuery = async (req, res) => {
    try {

        const allEmail = `SELECT distinct username FROM public.login `;

        const query = `WITH matched_stations AS (
                        SELECT 
                            sd.station_name,
                            sd.station_code,
                            l.username
                        FROM 
                            public.station_details AS sd
                        JOIN 
                            public.login AS l 
                        ON LOWER(l.name) = LOWER(sd.centre_type || ' ' || sd.centre_name)
                        WHERE 
                            sd.station_code IN (
                                SELECT 
                                    station_id 
                                FROM 
                                    public.station_daily_data 
                                WHERE 
                                    collection_date = CURRENT_DATE 
                                    AND (data IS NOT NULL AND data != (-999.9)) AND is_verified = 0
                            )
                    )
                    , grouped_stations AS (
                        SELECT 
                            station_code, 
                            MIN(station_name) AS station_name, 
                            MIN(username) AS username
                        FROM 
                            matched_stations
                        GROUP BY 
                            station_code
                    )
                    SELECT *
                    FROM 
                        grouped_stations
                    WHERE 
                        username = $1
                    ORDER BY 
                        username, 
                        station_name;`;

        const result = await client.query(allEmail);
         result.rows.map(async item => {
            const result1 = await client.query(query,[item.username]);
            if(result1.rows[0]){
                let trows = `<table border='1'> 
                                <thead>
                                <tr>
                                    <th>Station Name</th>
                                    <th>Station Id</th>
                                </tr>
                                </thead>
                                <tbody>`
                result1.rows.map(data =>{
                    trows+=`<tr><td>${data.station_name}</td><td>${data.station_code}</td></tr>`
                })
                trows+=`</tbody>
                        </table>`

                sendEmail({to:"ghanshyampal789@gmail.com",subject:item.username,html:trows})  
                console.log(trows);            
            }
            
         })


        return {success:true,message:"query fatched successfully"}
    } catch (error) {
        console.error(error);
        return {success:false,message:error.message}
    }
}
