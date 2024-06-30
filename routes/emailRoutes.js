const express = require("express")
const router = express.Router()

const { testMail} = require("../controllers/Email")



// ********************************************************************************************************
//                                      Email routes
// ********************************************************************************************************
router.get('/sendemail',testMail)

module.exports = router;


// SELECT * FROM public.station_details
// where station_code  in (
// 	select station_id 
// 	from public.station_daily_data 
// 	where collection_date = '2024-06-12' and (data = null or data =-999.9) 
// )
// order by centre_type,centre_name