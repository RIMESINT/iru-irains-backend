const client = require("./connection");
const express = require("express");
const app = express();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const xlsx = require('xlsx');
const nodemailer = require('nodemailer');

const normalRegionRoutes = require("./routes/normalsRoutes")
    // const cron = require('node-cron');

// cron.schedule('0 14 * * *', () => {
// });

app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    res.header(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, PATCH, DELETE, OPTIONS"
    );
    next();
});

const smtpTransport = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: 'saurav@rimes.int',
        pass: 'sxcjuiwivyptrxkp'
    }
});

app.post('/send-email', (req, res) => {
    const { to, subject, text, attachments } = req.body;
    const mailOptions = {
        from: 'saurav@rimes.int',
        to: to,
        subject: subject,
        text: text,
        attachments: attachments
    };
    console.log("Sending Email");
    smtpTransport.sendMail(mailOptions, (error, response) => {
        if (error) {
            console.log(error);
            client.query('INSERT INTO email_log(email, subject, message, datetime, status) VALUES($1, $2, $3, $4, $5)', [mailOptions.to, mailOptions.subject, mailOptions.text, new Date(), false])
                .then(() => {
                    res.status(200).json({ message: 'Data inserted successfully' });
                })
                .catch(error => {
                    console.error('Error inserting data:', error);
                    res.status(500).json({ error: 'Internal server error' });
                });
            // res.status(500).send('Error sending email');
        } else {
            console.log('Email sent: ' + response.message);
            client.query('INSERT INTO email_log(email, subject, message, datetime, status) VALUES($1, $2, $3, $4, $5)', [mailOptions.to, mailOptions.subject, mailOptions.text, new Date(), true])
                .then(() => {
                    res.status(200).json({ message: 'Data inserted successfully' });
                })
                .catch(error => {
                    console.error('Error inserting data:', error);
                    res.status(500).json({ error: 'Internal server error' });
                });
            // res.send('Email sent successfully');
        }
    });
});

app.post('/addData', (req, res) => {
    const data = req.body.data;
    client.query('INSERT INTO existingstationdata(stationname, stationid, datetime, stationtype, neworold, lat, lng, activationdate) VALUES($1, $2, $3, $4, $5, $6, $7, $8)', [data.stationName, data.stationId, data.dateTime, data.stationType, data.newOrOld, data.lat, data.lng, data.activationDate])
        .then(() => {
            res.status(200).json({ message: 'Data inserted successfully' });
        })
        .catch(error => {
            console.error('Error inserting data:', error);
            res.status(500).json({ error: 'Internal server error' });
        });
});

app.post('/deletedstationlog', (req, res) => {
    const data = req.body.data;
    client.query('INSERT INTO deletedstationlog(stationname, stationid, datetime, username, type) VALUES($1, $2, $3, $4, $5)', [data.stationName, data.stationId, data.dateTime, data.userName, data.type])
        .then(() => {
            res.status(200).json({ message: 'Data inserted successfully' });
        })
        .catch(error => {
            console.error('Error inserting data:', error);
            res.status(500).json({ error: 'Internal server error' });
        });
});

app.get("/deletedstationlog", (req, res) => {
    client.query(
        "SELECT * FROM deletedstationlog ORDER BY id ASC",
        (err, result) => {
            if (err) {
                res.send(err);
            }
            res.send(result.rows);
        }
    );
});

app.get("/emaillog", (req, res) => {
    client.query(
        "SELECT * FROM email_log ORDER BY id ASC",
        (err, result) => {
            if (err) {
                res.send(err);
            }
            res.send(result.rows);
        }
    );
});

app.get("/emailgroup", (req, res) => {
    client.query(
        "SELECT * FROM email_group ORDER BY id ASC",
        (err, result) => {
            if (err) {
                res.send(err);
            }
            res.send(result.rows);
        }
    );
});

app.post('/emailgroup', (req, res) => {
    const data = req.body;
    client.query('INSERT INTO email_group(groupname, emails) VALUES($1, $2)', [data.groupName, data.emails])
        .then(() => {
            res.status(200).json({ message: 'Data inserted successfully' });
        })
        .catch(error => {
            console.error('Error inserting data:', error);
            res.status(500).json({ error: 'Internal server error' });
        });
});

app.put("/updateexistingstationdata", (req, res) => {
    const data = req.body.data;
    client.query('UPDATE existingstationdata SET stationname = $1, stationid = $2, datetime = $3, stationtype = $4, neworold = $5, lat = $6, lng = $7, activationdate = $8 WHERE stationid = $9', [
            data.stationname,
            data.stationid,
            data.dateTime,
            data.stationType,
            data.newOrOld,
            data.lat,
            data.lng,
            data.activationDate,
            data.previousstationid
        ])
        .then(() => {
            res.status(200).json({ message: `Row with ID ${data.previousstationid} updated successfully` });
        })
        .catch((error) => {
            console.error('Error updating data:', error);
            res.status(500).json({ error: 'Internal server error' });
        });
});
app.delete("/deleteexistingstationdata", (req, res) => {
    const data = req.body.data;
    client
        .query('DELETE FROM existingstationdata WHERE stationid = $1', [data])
        .then(() => {
            res.status(200).json({ message: `Row with stationid ${data} deleted successfully` });
        })
        .catch((error) => {
            console.error('Error deleting data:', error);
            res.status(500).json({ error: 'Internal server error' });
        });
});

app.get("/existingstationdata", (req, res) => {
    client.query(
        "SELECT * FROM existingstationdata JOIN stationdatadaily ON existingstationdata.stationid = stationdatadaily.station_id ORDER BY station_id",
        (err, result) => {
            if (!err) {
                res.send(result.rows);
            } else {
                res.send(err);
            }
        }
    );
});

app.put("/addcolumn", (req, res) => {
    const data = req.body.data;
    try {
        client.query('BEGIN');
        const queryText = `ALTER TABLE existingstationdata ADD COLUMN IF NOT EXISTS "${'isverified_'+data.date}" character varying DEFAULT null`;
        client.query(queryText);
        client.query('COMMIT');
        res.status(200).json({ message: `Column Created successfully` });
    } catch (error) {
        client.query('ROLLBACK');
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.put("/addcolumnfordailydata", (req, res) => {
    const data = req.body.data;
    try {
        client.query('BEGIN');
        const queryText = `ALTER TABLE stationdatadaily ADD COLUMN IF NOT EXISTS "${data.date}" double precision DEFAULT -999.9`;
        client.query(queryText);
        client.query('COMMIT');
        res.status(200).json({ message: `Column Created successfully` });
    } catch (error) {
        client.query('ROLLBACK');
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.put("/verifiedrainfall", (req, res) => {
    const data = req.body.data;
    try {
        // Begin a transaction
        client.query('BEGIN');
        // Loop through each object and insert into the database
        for (const element of data.verifiedstationdata) {
            const queryText = `UPDATE existingstationdata SET "${'isverified_'+data.date}" = '${data.verifiedDateTime}' WHERE stationid = ${element.station_id}`;
            // Execute the query
            client.query(queryText);
        }
        // Commit the transaction
        client.query('COMMIT');
        res.status(200).json({ message: `Verified successfully` });
    } catch (error) {
        // Rollback the transaction in case of an error
        client.query('ROLLBACK');
        res.status(500).json({ error: 'Internal server error' });
        console.error('Error inserting data:', error);
    }
});

app.get("/masterFile", (req, res) => {
    client.query(
        "SELECT * FROM masterfile JOIN stationdatadaily ON masterfile.station_code = stationdatadaily.station_id ORDER BY station_id",
        (err, result) => {
            if (err) {
                res.send(err);
            }
            res.send(result.rows);
        }

    );

});

app.get("/districtdep", (req, res) => {
    client.query(
        "SELECT * FROM ndistrict ORDER BY district_code ASC",
        (err, result) => {
            if (err) {
                res.send(err);
            }
            res.send(result.rows);
        }
    );
});
app.get("/statenormal", (req, res) => {
    client.query(
        "SELECT * FROM nstate",
        (err, result) => {
            if (err) {
                res.send(err);
            }
            res.send(result.rows);
        }
    );
});
app.get("/subdivnormal", (req, res) => {
    client.query(
        "SELECT * FROM nsubdivision",
        (err, result) => {
            if (err) {
                res.send(err);
            }
            res.send(result.rows);
        }
    );
});

app.get("/regionnormal", (req, res) => {
    client.query(
        "SELECT * FROM nregion",
        (err, result) => {
            if (err) {
                res.send(err);
            }
            res.send(result.rows);
        }
    );
});
app.get("/countrynormal", (req, res) => {
    client.query(
        "SELECT * FROM ncountry",
        (err, result) => {
            if (err) {
                res.send(err);
            }
            res.send(result.rows);
        }
    );
});


const generateSecretKey = () => {
    const secretKey = crypto.randomBytes(32).toString('hex');
    return secretKey;
};

const secretKey = generateSecretKey();
app.post("/login", (req, res) => {
    client.query(
        `SELECT * FROM login WHERE username = '${req.body.username}' AND password = '${req.body.password}';`,
        (err, result) => {
            console.log(result.rows, "hhhh")
            if (err) {
                res.send({ message: "Server Error", err });
            } else {
                if (result.rows.length) {
                    const user = {
                        userName: req.body.username,
                        password: req.body.password
                    }
                    jwt.sign({ user }, secretKey, { expiresIn: '300s' }, (err, token) => {
                        res.json({ message: "Login successful", token: token, data: result.rows })
                    })
                } else {
                    res.send({ message: "Username and Passwrod are Invalid" });
                }
            }
        }
    );
});

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post('/upload', async(req, res) => {
    try {
        const data = req.body;
        const result = await client.query(
            'INSERT INTO pdf_files (file_name, file_data, section_name) VALUES ($1, $2, $3) RETURNING id', [data.fileName, data.fileData, data.sectionName]
        );
        res.json({ success: true, fileId: result.rows[0].id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

app.get("/uploadedfiles", (req, res) => {
    client.query(
        "SELECT * FROM pdf_files",
        (err, result) => {
            if (err) {
                res.send(err);
            }
            res.send(result.rows);
        }
    );
});

app.get('/download/:id', async(req, res) => {
    try {
        const fileId = req.params.id;
        const result = await client.query('SELECT * FROM pdf_files WHERE id = $1', [fileId]);

        if (result.rows.length === 0) {
            res.status(404).json({ success: false, error: 'File not found' });
            return;
        }

        const { file_name, file_data } = result.rows[0];
        res.setHeader('Content-Disposition', `attachment; filename=${file_name}`);
        res.setHeader('Content-Type', 'application/pdf');
        res.send(file_data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

app.post('/uploadstationdata', upload.single('file'), async(req, res) => {
    try {
        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

        // const client = new Client(dbConfig);
        // await client.connect();

        // Replace with your PostgreSQL table name
        const tableName = 'existingstationdata';

        await client.query(`
      CREATE TABLE IF NOT EXISTS ${tableName} (
        stationname character varying COLLATE pg_catalog."default",
        stationid numeric,
        datetime character varying COLLATE pg_catalog."default",
        stationtype character varying COLLATE pg_catalog."default",
        neworold character varying COLLATE pg_catalog."default",
        lat character varying COLLATE pg_catalog."default",
        lng character varying COLLATE pg_catalog."default",
        activationdate character varying COLLATE pg_catalog."default"
      );`);

        for (const row of sheetData) {
            const values = Object.values(row)
                .map(value => `'${value}'`)
                .join(', ');
            await client.query(`INSERT INTO ${tableName} VALUES (${values});`);
        }

        // await client.end();
        res.status(200).json({ message: 'Data uploaded successfully' });
    } catch (error) {
        console.error('Error uploading data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/uploadrainfalldata', upload.single('file'), async(req, res) => {
    try {
        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
        const date = req.body.date;

        // Begin a transaction
        client.query('BEGIN');
        // Loop through each object and insert into the database
        for (const element of sheetData) {
            const queryText = `UPDATE stationdatadaily SET "${date}" = ${element[date]} WHERE station_id = ${element.stationid}`;
            // Execute the query
            client.query(queryText);
        }
        // Commit the transaction
        client.query('COMMIT');
        res.status(200).json({ message: `Updated successfully` });
        console.log('Data inserted successfully!');
    } catch (error) {
        // Rollback the transaction in case of an error
        client.query('ROLLBACK');
        res.status(500).json({ error: 'Internal server error' });
        console.error('Error inserting data:', error);
    }
});

app.put("/updaterainfall", (req, res) => {
    const data = req.body.data;
    try {
        // Begin a transaction
        client.query('BEGIN');
        // Loop through each object and insert into the database
        for (const element of data.updatedstationdata) {
            const queryText = `UPDATE stationdatadaily SET "${data.date}" = ${element.RainFall} WHERE station_id = ${element.stationid}`;
            // Execute the query
            client.query(queryText);
        }
        // Commit the transaction
        client.query('COMMIT');
        res.status(200).json({ message: `Updated successfully` });
        console.log('Data inserted successfully!');
    } catch (error) {
        // Rollback the transaction in case of an error
        client.query('ROLLBACK');
        res.status(500).json({ error: 'Internal server error' });
        console.error('Error inserting data:', error);
    }
});




// db code start


function extractMonthAndDate(key) {
    const monthStr = key.match(/[a-zA-Z]+/)[0]; // Extract the alphabetic part (month)
    const date = parseInt(key.match(/\d+/)[0], 10); // Extract the numeric part (date)
    const year = new Date().getFullYear();
    return { month: months[monthStr], date, year };
}
const months = {
    "Jan": 1,
    "Feb": 2,
    "Mar": 3,
    "Apr": 4,
    "May": 5,
    "Jun": 6,
    "Jul": 7,
    "Aug": 8,
    "Sep": 9,
    "Oct": 10,
    "Nov": 11,
    "Dec": 12
};
app.get('/country', async(req, res) => {
    try {
        const result = await client.query('SELECT * FROM ncountry ');
        if (result.rows.length === 0) {
            res.status(404).json({ success: false, error: 'File not found' });
            return;
        }
        const data = result.rows[0]
        var insert_query = "INSERT INTO normal_country (date, country_name, cumulative_rainfall_value) VALUES ";
        for (const key in data) {
            if (data.hasOwnProperty(key) && key !== 'country_as_whole') {
                const { month, date, year } = extractMonthAndDate(key);
                insert_query += `(  '${year}-${month}-${date}', 'INDIA', ${data[key]}),`;

            }
        }
        insert_query = insert_query.slice(0, -1);
        await client.query("CREATE TABLE IF NOT EXISTS public.normal_country ( id SERIAL PRIMARY KEY, date DATE NOT NULL, country_name VARCHAR(255) NOT NULL, cumulative_rainfall_value NUMERIC(10, 2) NOT NULL )");
        await client.query(" TRUNCATE TABLE  public.normal_country");
        await client.query(insert_query);
        res.status(200).json({ message: "Data Inserted Successfully" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

app.get('/state', async(req, res) => {
    try {
        const result = await client.query('SELECT * FROM nstate ');
        if (result.rows.length === 0) {
            res.status(404).json({ success: false, error: 'File not found' });
            return;
        }
        var insert_query = "INSERT INTO normal_state (date, state_name, state_code, cumulative_rainfall_value) VALUES ";
        result.rows.forEach(data => {
            const state_name = data['statename']
            const state_code = data['state_code']
            for (const key in data) {
                if (data.hasOwnProperty(key) && key !== 'statename' && key !== 'state_code') {
                    const { month, date, year } = extractMonthAndDate(key);
                    insert_query += `(  '${year}-${month}-${date}', '${state_name}', ${state_code}, ${data[key]}),`;
                }
            }
        });
        insert_query = insert_query.slice(0, -1);
        await client.query("CREATE TABLE IF NOT EXISTS public.normal_state ( id SERIAL PRIMARY KEY, date DATE NOT NULL, state_name VARCHAR(255) NOT NULL,  state_code integer NOT NULL, cumulative_rainfall_value NUMERIC(10, 2) NOT NULL )");
        await client.query(" TRUNCATE TABLE  public.normal_state");
        await client.query(insert_query);
        res.status(200).json({ message: insert_query });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});


app.get('/district', async(req, res) => {
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

            for (const key in data) {
                if (data.hasOwnProperty(key) && key !== 'region_name' && key !== 'region_code' && key !== 'subdiv_name' && key !== 'sd' && key !== 'subdiv_code' && key !== 'state_name' && key !== 'rst' && key !== 'state_code' && key !== 'district_name' && key !== 'ddd' && key !== 'district_code') {
                    const { month, date, year } = extractMonthAndDate(key);
                    await client.query("INSERT INTO normal_district (date, cumulative_rainfall_value, normal_district_details_id) VALUES ($1, $2, $3)", [`'${year}-${month}-${date}'`, data[key], detail_result_id])
                }
            }
        });
        res.status(200).json({ message: "District Normal Migrated Successfully" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});



// db code end




app.use("/api/v1/", normalRegionRoutes);

app.listen(3000, () => {
    console.log("Server started at PORT 3000");
});
client.connect();