const express = require("express")
const router = express.Router()

const { fetchDistrictData, getAllDistrict} = require("../controllers/District")
const { getnDistrictDataAndInsertInNormalDistrict } = require("../controllers/scripts/district/normalDistrict");


// ********************************************************************************************************
//                                      Email routes
// ********************************************************************************************************
