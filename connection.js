const { Client } = require('pg');
require('dotenv').config();


const db = process.env.DB 
const db_pass = process.env.DB_PASS
const db_host = process.env.DB_HOST
const db_user = process.env.DB_USER
const db_port = process.env.DB_PORT
const client = new Client({
    host: db_host,
    user: db_user,
    port: db_port,
    password: db_pass,
    database : db
});

module.exports = client;