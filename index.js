const https = require("https");
const fs = require("fs");
const client = require("./connection");
const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();

require("./controllers/CronJobs.js"); // Adjust path if cron.js is in a different directory, e.g., "./src/cron"

const districtRoutes = require("./routes/districtRoutes");
const stationRoutes = require("./routes/stationRoutes");
const stateRoutes = require("./routes/stateRoutes");
const subDivisionRoutes = require("./routes/subDivisionRoutes");
const regionRoutes = require("./routes/regionRoutes");
const countryRoutes = require("./routes/countryRoutes");
const centreRoutes = require("./routes/centreRoutes");
const emailRoutes = require("./routes/emailRoutes");
const pdfRoutes = require("./routes/pdfRoutes");
const resetPassRoutes = require("./routes/resetPassRoutes");
const blockRoutes = require("./routes/blockRoutes");
const mapImageRoutes = require("./routes/mapImageRoutes");
const spatialDistribution = require("./routes/spatialDistributionRoutes");
const awsRoutes = require("./routes/awsRoutes");

// // Load SSL Certificate
const options = {
    key: fs.readFileSync("/etc/apache2/private.key"),
    cert: fs.readFileSync("/etc/apache2/*.imd.gov.in.crt"),
    ca: fs.readFileSync("/etc/apache2/emSign-SSL-CA-G1.crt"),
};

app.use(cors());
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));

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

// Generate JWT Secret Key
const generateSecretKey = () => {
  return crypto.randomBytes(32).toString("hex");
};

const secretKey = generateSecretKey();

app.post("/login", (req, res) => {
  client.query(
    `SELECT * FROM login WHERE username = '${req.body.username}' AND password = '${req.body.password}';`,
    (err, result) => {
      if (err) {
        res.send({ message: "Server Error", err });
      } else {
        if (result.rows.length) {
          const user = {
            userName: req.body.username,
            password: req.body.password,
          };
          jwt.sign({ user }, secretKey, { expiresIn: "300s" }, (err, token) => {
            res.json({
              message: "Login successful",
              token: token,
              data: result.rows,
            });
          });
        } else {
          res.send({ message: "Username and Password are Invalid" });
        }
      }
    }
  );
});

const port = process.env.PORT || 3000;

app.use("/api/v1/", regionRoutes);
app.use("/api/v1/", districtRoutes);
app.use("/api/v1/", stationRoutes);
app.use("/api/v1/", stateRoutes);
app.use("/api/v1/", subDivisionRoutes);
app.use("/api/v1/", regionRoutes);
app.use("/api/v1/", countryRoutes);
app.use("/api/v1/", centreRoutes);
app.use("/api/v1/", emailRoutes);
app.use("/api/v1/", pdfRoutes);
app.use("/api/v1/", resetPassRoutes);
app.use("/api/v1/", blockRoutes);
app.use("/api/v1/maps/", mapImageRoutes);
app.use("/api/v1/", spatialDistribution);
app.use("/api/v1/up-aws/", awsRoutes);

// Use HTTPS Server
https.createServer(options, app).listen(port, () => {
  console.log(`Secure HTTPS Server started at PORT ${port}`);
});

// app.listen(3000, () => {
//   console.log(`Server running at http://localhost:${port}`);
// });

client.connect();
