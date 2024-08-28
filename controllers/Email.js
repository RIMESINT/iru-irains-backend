const sendEmail  = require("../configEmail");
const client = require("../connection");
// const moment = require('moment');


exports.sendManualMail = async (req, res) => {
    try {
        const { to, subject, text , attachments, html } = req.body;
        // const attachments = req.files.file1;

        if(!to){
            return res.status(400).json({message: "Please provide a valid email address"});
        }

        const resp = await sendEmail({to, subject, text, attachments,html})

        if(!resp?.success){
            return res.status(500).json({
                success: false,
                message: "Failed to send Email",
            });
        }

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

exports.sendMailToGroup = async (req, res) => {
    try {
        const { groupId, subject, text , attachments, html } = req.body;
        // const attachments = req.files.file1;

        if(!groupId){
            return res.status(400).json({message: "Please provide a valid group"});
        }

        const query = `SELECT * FROM public.email_group where id = $1`;
        
        const result = await client.query(query, [groupId]);

        const emailList = result?.rows[0]?.emails?.mails || null;

        if (!emailList || emailList.length === 0) {
            return res.status(404).json({ message: "No emails found for the provided group" });
        }

        const emailPromises = emailList.map(email => sendEmail({ to: email, subject, text, attachments, html }));

        const results = await Promise.allSettled(emailPromises);

        const successfulEmails = results.filter(result => result.status === true);
        const failedEmails = results.filter(result => result?.value?.success === false);

        if (failedEmails.length > 0) {
            return res.status(500).json({
                success: false,
                message: "Failed to send some emails",
                errors: failedEmails.map(fail => fail.reason)
            });
        }

        res.status(200).json({
            success: true,
            message: "Emails Sent Successfully",
            data: results
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

        // res.status(200).json({
        //     success: true,
        //     message: "Email Sent Successfully",
        //     // data: data
        // });

    } catch (error) {
        console.error(error);
        // res.status(500).json({
        //     success: false,
        //     message: "Failed to send Email",
        //     error: error.message,
        // });
    }
}


exports.dailyDataVerificationReminder = async (req, res) => {
    try {
        dailyDataVerificationReminderQuery()

        // res.status(200).json({
        //     success: true,
        //     message: "Email Sent Successfully",
        //     // data: data
        // });

    } catch (error) {
        console.error(error);
        // res.status(500).json({
        //     success: false,
        //     message: "Failed to send Email",
        //     error: error.message,
        // });
    }
}




dailyDataUpdateReminderQuery = async (req, res) => {
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
                                    public.station_daily_data_updates
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
                                    public.station_daily_data_updates
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

exports.fetchEmailLogs = async (req, res) => {
    // const limit = parseInt(req.query.limit) || 25;  // Default to 10 if limit is not provided or invalid

    try {
        const result = await client.query('SELECT * FROM public.email_log');
        
        res.status(200).json({
            success: true,
            message: "Fetched email logs successfully",
            data: result.rows
        });
    } catch (error) {
        console.error('Error fetching email logs:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.createEmailGroups = async (req, res) => {
    try {
        const { groupName, emails } = req.body;

        // Check if the groupName already exists
        const checkQuery = `SELECT * FROM public.email_group WHERE groupname = $1`;
        const checkResult = await client.query(checkQuery, [groupName]);
        
        if (checkResult.rows.length > 0) {
            return res.status(400).json({ message: 'Group name already exists' });
        }

        // Insert data into email_group table
        const query = `
            INSERT INTO public.email_group (groupname, emails)
            VALUES ($1, $2)
        `;
        
        await client.query(query, [groupName, { mails: emails }]);

        res.status(201).json({ message: 'Email group created successfully' });
    } catch (error) {
        console.error('Error inserting email group:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.fetchEmailGroups = async (req, res) => {
    // const limit = parseInt(req.query.limit) || 25;  // Default to 10 if limit is not provided or invalid

    try {
        const result = await client.query('SELECT * FROM public.email_group');
        
        res.status(200).json({
            success: true,
            message: "Fetched email groups successfully",
            data: result.rows
        });
    } catch (error) {
        console.error('Error fetching email groups:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.deleteEmailGroup = async (req, res) => {
    try {
        const {groupId} = req.body;

        if (!groupId) {
            return res.status(400).json({ message: 'Please provide a valid group ID' });
        }

        // Check if the email group exists
        const checkQuery = `SELECT * FROM public.email_group WHERE id = $1`;
        const checkResult = await client.query(checkQuery, [groupId]);

        if (checkResult.rows.length === 0) {
            return res.status(404).json({ message: 'Email group not found' });
        }

        // Delete the email group
        const deleteQuery = `DELETE FROM public.email_group WHERE id = $1`;
        await client.query(deleteQuery, [groupId]);

        res.status(200).json({ message: 'Email group deleted successfully' });
    } catch (error) {
        console.error('Error deleting email group:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.updateEmailGroups = async (req, res) => {
    try {
        const { groupId, groupName, emails } = req.body;

        if (!groupId) {
            return res.status(400).json({ message: 'Please provide a valid group ID' });
        }

        if (!groupName) {
            return res.status(400).json({ message: 'Please provide a valid group name' });
        }

        if (!emails || !Array.isArray(emails) || emails.length === 0) {
            return res.status(400).json({ message: 'Please provide a valid list of emails' });
        }

        // Check if the email group exists
        const checkQuery = `SELECT * FROM public.email_group WHERE id = $1`;
        const checkResult = await client.query(checkQuery, [groupId]);

        if (checkResult.rows.length === 0) {
            return res.status(404).json({ message: 'Email group not found' });
        }

        // If the group exists, update it
        const updateQuery = `
            UPDATE public.email_group
            SET groupname = $1, emails = $2
            WHERE id = $3
        `;
        await client.query(updateQuery, [groupName, { mails: emails }, groupId]);
        return res.status(200).json({ message: 'Email group updated successfully' });

    } catch (error) {
        console.error('Error updating email group:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
