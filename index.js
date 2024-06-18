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
require('dotenv').config();

const districtRoutes = require("./routes/districtRoutes")
const stationRoutes = require("./routes/stationRoutes")
const stateRoutes = require("./routes/stateRoutes")
const subDivisionRoutes = require("./routes/subDivisionRoutes")
const regionRoutes = require("./routes/regionRoutes")
const countryRoutes = require("./routes/countryRoutes")

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

const port = process.env.PORT || 3000;

app.use("/api/v1/", regionRoutes);
app.use("/api/v1/", districtRoutes);
app.use("/api/v1/", stationRoutes);
app.use("/api/v1/", stateRoutes);
app.use("/api/v1/", subDivisionRoutes);
app.use("/api/v1/", regionRoutes);
app.use("/api/v1/", countryRoutes);


app.listen(port, () => {
    console.log(`Server started at PORT ${port}`);
});
client.connect();