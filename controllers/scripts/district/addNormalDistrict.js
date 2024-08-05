
const express = require("express");
const router = express.Router();
const app = express();
const client = require("../../../connection");
const convertDate = require("../../../utils/convertDate");
const xlsx = require("xlsx");




exports.addNewDistrictDetails = async (req, res) => {
    try {
        
        console.log('success');

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
}