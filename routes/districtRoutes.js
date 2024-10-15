const express = require("express")
const router = express.Router()
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const { fetchDistrictData, getAllDistrict} = require("../controllers/District")
const { fetchDistrictDataFtp, fetchDistrictDataInBunchOfDatesFtp} = require("../controllers/ftp/District")
const { getnDistrictDataAndInsertInNormalDistrict } = require("../controllers/scripts/district/normalDistrict");
const { addNewDistrictDetails } = require("../controllers/scripts/district/addNormalDistrict");


// ********************************************************************************************************
//                                      District routes
// ********************************************************************************************************

// for scripts
router.get("/nDistrictPrev", getnDistrictDataAndInsertInNormalDistrict);
router.post("/addNewDistrictDetails", upload.single('file'), addNewDistrictDetails);
router.post("/addNewDistrictDetails", upload.single('file'), addNewDistrictDetails);



// fetch district data
router.post("/fetchDistrictData", fetchDistrictData);
// fetch district data
router.get("/getAllDistrict", getAllDistrict);

router.post("/fetchDistrictDataInBunchOfDatesFtp", fetchDistrictDataInBunchOfDatesFtp);



// ********************************************************************************************************
//                                      District routes for FTP
// ********************************************************************************************************


// fetch district data
router.post("/fetchDistrictDataFtp", fetchDistrictDataFtp);



module.exports = router;