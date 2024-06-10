
const express = require("express");
const router = express.Router();
const app = express();
const client = require("../connection");
const { format, addDays, isAfter } = require('date-fns');

function formatDate(inputDate) {
    const date = new Date(inputDate);
    return format(date, 'dd_MMM_yy');
  }


  function calculateDeparture(data) {
    return data.map(entry => {
      const actual = parseFloat(entry.actual_rainfall);
      let normal = parseFloat(entry.normal_rainfall);
  
      if (normal === 0) {
        normal = 0.01;
      }
  
      const departure = ((actual - normal) / normal)*100;
      return {
        ...entry,
        actual_rainfall :actual.toFixed(2) ,
        departure: departure.toFixed(2) // Keeping two decimal places
      };
    });
  }

  async function  fetchData(date){
    try {
        const inputDate = date; // Input date in YYYY-MM-DD format
        const formattedDate = formatDate(inputDate);

        const response =  await client.query(`
            SELECT 
                sd.district AS sd_district, 
                min(sd.region) as region,
                min(sd.metsubdivision) as metsubdivision,
                min(sd.station_id) as station_id,
                min(sd.district_code) as district_code,
                AVG(("sd"."${formattedDate}")::numeric) AS actual_rainfall,
                min(nd.rainfall_value) as normal_rainfall
            FROM 
                public.stationdatadaily AS sd
            JOIN 
                public.normal_district_details AS ndd
            ON 
                sd.district_code = ndd.district_code
            Join 
                public.normal_district AS nd
            ON 
                nd.normal_district_details_id = ndd.id
            WHERE 
                "sd"."${formattedDate}" != -999.9 and nd.date = '${inputDate}'
            GROUP BY 
                sd.district
            ORDER BY 
                sd.district;`);

        return response?.rows
        // return calculateDeparture(response?.rows)

       
    } catch (error) {
       console.log(error)
    }
  }

  async function iterateDates(startDate, endDate) {
    let currentDate = new Date(startDate);
    const end = new Date(endDate);
    const data = []
    while (!isAfter(currentDate, end)) {
    //   console.log(format(currentDate, 'yyyy-MM-dd'));
        data.push(await fetchData(format(currentDate, 'yyyy-MM-dd'))) 
      currentDate = addDays(currentDate, 1);
    }
    return data
  }


exports.getDistrictData = async (req, res) => {
    try {
        const start_date = req.startDate;
        const end_date = req.endDate;

        // if(new Date(start_date)>new Date(end_date)){
        //    return res.status(400).json({  
        //         success : false,
        //         message :  "Wrong Date",
        //         // message1 :  data
        //     });
        // }
        const data = await iterateDates(start_date, end_date);

  // Function to add data to the combined object
  const combined = {};
  const addData = (data) => {
    data.forEach(entry => {
      const districtCode = entry.district_code;
      if (!combined[districtCode]) {
        combined[districtCode] = {
          ...entry,
          actual_rainfall: parseFloat(entry.actual_rainfall),
          normal_rainfall: parseFloat(entry.normal_rainfall)
        };
      } else {
        combined[districtCode].actual_rainfall += parseFloat(entry.actual_rainfall);
        combined[districtCode].normal_rainfall += parseFloat(entry.normal_rainfall);
      }
    });
  };

  data.forEach( arr => addData(arr))
  const final = calculateDeparture(Object.values(combined))



        
        

        res.status(200).json({  
            success : true,
            message :  final,
            // message1 :  data
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            succes:false, 
            error : "Internal server error",
            message : error,
        });
    }
}