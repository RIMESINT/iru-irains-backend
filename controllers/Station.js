
const express = require("express");
const router = express.Router();
const app = express();
const client = require("../connection");
const moment = require('moment');
const xlsx = require('xlsx');


// const fetchFilteredData = async (Date) => {
//     const query = `
//                 SELECT ndd.region_code,
//                     ndd.region_name,
//                     ndd.new_state_code as state_code,
//                     ndd.state_name,
//                     ndd.district_code,
//                     ndd.district_name,
//                     sd.station_code,
//                     sd.station_name,
//                     sd.station_type,
//                     sd.centre_type,
//                     sd.centre_name,
//                     sd.is_new_station,
//                     sd.latitude,
//                     sd.longitude,
//                     sd.activationdate,
//                     sdd.data
//                 FROM public.station_details AS sd
//                 JOIN public.station_daily_data AS sdd 
//                     ON sdd.station_id = sd.station_code
//                 JOIN normal_district_details AS ndd 
//                     ON ndd.district_code = sdd.district_code
//                 WHERE sdd.collection_date = $1`;

//     try {
//         const result = await client.query(query, [Date]);
//         return result.rows;
//     } catch (error) {
//         console.error('Error executing query', error.stack);
//         throw error;
//     }
// }

const fetchFilteredData = async (startDate, endDate = null) => {
    let query;
    let values;
  
    if (endDate) {
      query = `
                SELECT  min(ndd.region_code) as region_code,
                        min(ndd.region_name) as region_name,
                        min(ndd.subdiv_name) as subdiv_name,
                        min(ndd.subdiv_code) as subdiv_code,
                        min(ndd.new_state_code) as state_code,
                        min( ndd.state_name) as state_name,
                        min(ndd.district_code) as district_code,
                        min(ndd.district_name) as district_name,
                        (sd.station_code) as station_code,
                        min(sd.station_name) as station_name,
                        min(sd.station_type) as station_type,
                        min(sd.centre_type) as centre_type,
                        min(sd.centre_name) as centre_name,
                        min(sd.is_new_station) as is_new_station,
                        min(sd.latitude) as latitude,
                        min(sd.longitude) as longitude,
                        min(sd.activationdate) as activationdate,
                        sum(sdd.data) as data
                    FROM public.station_details AS sd
                    JOIN public.station_daily_data AS sdd 
                    ON sdd.station_id = sd.station_code
                    JOIN normal_district_details AS ndd 
                    ON ndd.district_code = sdd.district_code
                    WHERE sdd.collection_date BETWEEN $1 AND $2 and sdd.data != (-999.9)
                    group by sd.station_code
                    order by station_code
                `;
      values = [startDate, endDate];
    } else {
      query = `
        SELECT ndd.region_code,
               ndd.region_name,
               ndd.subdiv_name,
               ndd.subdiv_code,
               ndd.new_state_code as state_code,
               ndd.state_name,
               ndd.district_code,
               ndd.district_name,
               sd.station_code,
               sd.station_name,
               sd.station_type,
               sd.centre_type,
               sd.centre_name,
               sd.is_new_station,
               sd.latitude,
               sd.longitude,
               sd.activationdate,
               sdd.data,
               sdd.is_verified,
               sdd.verified_at
        FROM public.station_details AS sd
        JOIN public.station_daily_data AS sdd 
          ON sdd.station_id = sd.station_code
        JOIN normal_district_details AS ndd 
          ON ndd.district_code = sdd.district_code
        WHERE sdd.collection_date = $1;
      `;
      values = [startDate];
    }
  
    try {
      const result = await client.query(query, values);
      return result.rows;
    } catch (error) {
      console.error('Error executing query', error.stack);
      throw error;
    }
  };

// const updateStationDataQuery = async (station_code, date, value ) => {
//     const query = `
//                 Update public.station_daily_data set data =$1, updated_at =now()
//                 WHERE collection_date = $2 and station_id = $3;`;  

//     try {
//         const result = await client.query(query, [value, date,station_code ]);
//         return result.rows;
//     } catch (error) {
//         console.error('Error executing query', error.stack);
//         throw error;
//     }
// }


const addNewStationQuery = async ({station_name, station_id, station_type, centre_type, centre_name, is_new_station, latitude, longitude, activationdate}) => {
    let district_code = station_id.toString().substring(0, 8);
    
    // Query to check if the station already exists
    const checkQuery = `SELECT 1 FROM station_details WHERE station_code = $1`;
    const checkValues = [station_id];

    try {
        // Check if station exists
        const checkResult = await client.query(checkQuery, checkValues);

        if (checkResult.rowCount > 0) {
            // Station exists, return a message or handle accordingly
            console.log('Station already exists');
            return {success:false, message: 'Station already exists' };
        }

        // Insert new station if it doesn't exist
        const insertQuery = `
            INSERT INTO station_details (
                district_code, station_name, station_code, station_type, centre_type, centre_name, 
                is_new_station, latitude, longitude, activationdate
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);`;

        const insertValues = [district_code, station_name, station_id, station_type, centre_type, centre_name, is_new_station, latitude, longitude, activationdate];

        const insertResult = await client.query(insertQuery, insertValues);
        addNewStationLogQuery({station_name,station_code:station_id,userid:111,action:"added"})
        return insertResult.rows;
    } catch (error) {
        console.error('Error executing query', error.stack);
        throw error;
    }
};



const editStationQuery = async (params) => {
    const {
        station_id,
        station_name,
        station_type,
        centre_type,
        centre_name,
        is_new_station,
        latitude,
        longitude,
        activation_date
    } = params;

    // Create an array to hold the fields to be updated
    let fields = [];
    let values = [];
    let fieldIndex = 2;

    // Check each optional parameter and add it to the fields array if it's provided
    if (station_name) {
        fields.push(`station_name = $${fieldIndex}`);
        values.push(station_name);
        fieldIndex++;
    }
    if (station_type) {
        fields.push(`station_type = $${fieldIndex}`);
        values.push(station_type);
        fieldIndex++;
    }
    if (centre_type) {
        fields.push(`centre_type = $${fieldIndex}`);
        values.push(centre_type);
        fieldIndex++;
    }
    if (centre_name) {
        fields.push(`centre_name = $${fieldIndex}`);
        values.push(centre_name);
        fieldIndex++;
    }
    if (is_new_station !== undefined) {
        fields.push(`is_new_station = $${fieldIndex}`);
        values.push(is_new_station);
        fieldIndex++;
    }
    if (latitude) {
        fields.push(`latitude = $${fieldIndex}`);
        values.push(latitude);
        fieldIndex++;
    }
    if (longitude) {
        fields.push(`longitude = $${fieldIndex}`);
        values.push(longitude);
        fieldIndex++;
    }
    if (activation_date) {
        fields.push(`activationdate = $${fieldIndex}`);
        values.push(activation_date);
        fieldIndex++;
    }

    // If no fields to update, return null
    if (fields.length === 0) {
        return null;
    }

    // Add station_id to the values array
    values.unshift(station_id);

    // Construct the update query
    const query = `
        UPDATE station_details
        SET ${fields.join(', ')}
        WHERE station_code = $1
        RETURNING *;
    `;

    try {
        // Execute the query
        const result = await client.query(query, values);

        // Return the updated station details
        return result.rowCount > 0 ? result.rows[0] : null;
    } catch (error) {
        console.error('Error executing query', error.stack);
        throw error;
    }
};


const deleteStationQuery = async (station_id) => {
    const getStationQuery = `
        SELECT station_name
        FROM station_details
        WHERE station_code = $1;
    `;

    const deleteStationQuery = `
        DELETE FROM station_details
        WHERE station_code = $1;
    `;

    try {
        // Execute the select query to get the station name
        const getResult = await client.query(getStationQuery, [station_id]);
        
        if (getResult.rows.length === 0) {
            return 'No station found';
        }

        const station_name = getResult.rows[0].station_name;

        // Execute the delete query
        const deleteResult = await client.query(deleteStationQuery, [station_id]);
        console.log(deleteResult);

        // Optionally, log the deletion action
        addNewStationLogQuery({ station_name, station_code: station_id, userid: 111, action: "deleted" });

        return deleteResult;
    } catch (error) {
        console.error('Error executing query', error.stack);
        throw error;
    }
};


// Helper function to format the date
const formatDate = (dateStr) => {
    const [day, month, year] = dateStr.split('_');
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthIndex = monthNames.indexOf(month);
    return `20${year}-${(monthIndex + 1).toString().padStart(2, '0')}-${day.padStart(2, '0')}`;
}

// update station data
const verifyStationDataQuery = async (date, station_id, userid) => {
    const updateQuery = `
      UPDATE public.station_daily_data
      SET is_verified = 1,
          verified_at = NOW(),
          verified_by = $3
      WHERE collection_date = $1 AND station_id = $2
      RETURNING *;
    `;
  
    const values = [date, station_id, userid];
  
    try {
      const { rows } = await client.query(updateQuery, values);
      return rows;
    } catch (error) {
      throw new Error(error.message);
    }
};

// update multiple stations
const updateMultipleStations = async (date, station_ids, verified_by) => {
    const updateQuery = `
      UPDATE public.station_daily_data
      SET is_verified = 1,
          verified_at = NOW(),
          verified_by = $3
      WHERE collection_date = $1 AND station_id = ANY($2::numeric[])
      RETURNING *;
    `;
  
    const values = [date, station_ids, verified_by];
  
    try {
      const { rows } = await client.query(updateQuery, values);
      return rows;
    } catch (error) {
      throw new Error(error.message);
    }
};



const addNewStationLogQuery = async (params) => {
    let {station_name, station_code,  userid, action} = params;
    let district_code = station_code.toString().substring(0, 8);
    
    try {
        if (!station_code || !station_name || !district_code || !userid || !action) {
            // Station exists, return a message or handle accordingly
            console.log('Missing Parameters');
            return {success:false, message: 'Parameters are missing' };
        }

        // Insert new station if it doesn't exist
        const insertQuery = `
            INSERT INTO station_logs (station_code, station_name, district_code, log_date, userid, log_type)
            VALUES ($1, $2, $3, CURRENT_TIMESTAMP, $4, $5);`;

        const insertValues = [station_code, station_name, district_code, userid, action];

        const insertResult = await client.query(insertQuery, insertValues);
        return insertResult.rows;
    } catch (error) {
        console.error('Error executing query', error.stack);
        throw error;
    }
};


const fetchFilteredDataInRange = async (Date, lat,long,range) => {
    let query;
    let values;
  

     query = `
    			SELECT ndd.region_code,
               ndd.region_name,
               ndd.subdiv_name,
               ndd.subdiv_code,
               ndd.new_state_code as state_code,
               ndd.state_name,
               ndd.district_code,
               ndd.district_name,
               sd.station_code,
               sd.station_name,
               sd.station_type,
               sd.centre_type,
               sd.centre_name,
               sd.is_new_station,
               sd.latitude,
               sd.longitude,
               sd.activationdate,
               sdd.data,
               sdd.is_verified,
               sdd.verified_at,
			   sd.distance_km
        FROM 
(WITH params AS (
        SELECT 
            $1::numeric AS lat_point,  
            $2::numeric AS lon_point,  
            $3::numeric AS radius_km         
    )
    SELECT
        district_code,
        station_name,
        station_code,
        station_type,
        station_type_old,
        centre_type,
        centre_name,
        is_new_station,
        latitude,
        longitude,
        activationdate,
        created_at,
        updated_at,
        6371 * 2 * ASIN(SQRT(
            POWER(SIN((radians(latitude::numeric) - radians(params.lat_point)) / 2), 2) +
            COS(radians(params.lat_point)) * COS(radians(latitude::numeric)) *
            POWER(SIN((radians(longitude::numeric) - radians(params.lon_point)) / 2), 2)
        )) AS distance_km
    FROM
        public.station_details, params
    WHERE
        6371 * 2 * ASIN(SQRT(
            POWER(SIN((radians(latitude::numeric) - radians(params.lat_point)) / 2), 2) +
            COS(radians(params.lat_point)) * COS(radians(latitude::numeric)) *
            POWER(SIN((radians(longitude::numeric) - radians(params.lon_point)) / 2), 2)
        )) <= params.radius_km) AS sd

		JOIN public.station_daily_data AS sdd 
          ON sdd.station_id = sd.station_code
        JOIN normal_district_details AS ndd 
          ON ndd.district_code = sdd.district_code
        WHERE sdd.collection_date = $4;
		
`;

      values = [lat,long,range,Date];
    
  
    try {
      const result = await client.query(query, values);
      return result.rows;
    } catch (error) {
      console.error('Error executing query', error.stack);
      throw error;
    }
  };

  const fetchStationWithMaxRainfallQuery = async (startDate,endDate,limit) => {
    let query;
    let values;
  

     query = `
    			SELECT 
    ndd.region_code AS region_code,
    ndd.region_name AS region_name,
    ndd.subdiv_name AS subdiv_name,
    ndd.subdiv_code AS subdiv_code,
    ndd.new_state_code AS state_code,
    ndd.state_name AS state_name,
    ndd.district_code AS district_code,
    ndd.district_name AS district_name,
    sd.station_code AS station_code,
    sd.station_name AS station_name,
    sd.station_type AS station_type,
    sd.centre_type AS centre_type,
    sd.centre_name AS centre_name,
    sd.is_new_station AS is_new_station,
    sd.latitude AS latitude,
    sd.longitude AS longitude,
    sd.activationdate AS activationdate,
    sdd.data AS data,
	sdd.collection_date as date
FROM 
    public.station_details AS sd
JOIN 
    public.station_daily_data AS sdd 
    ON sdd.station_id = sd.station_code
JOIN 
    normal_district_details AS ndd 
    ON ndd.district_code = sdd.district_code
WHERE 
    sdd.collection_date BETWEEN $1 AND $2 
    AND sdd.data != -999.9
ORDER BY 
    sdd.data DESC
LIMIT $3;

		
`;

      values = [startDate,endDate,limit];
    
  
    try {
      const result = await client.query(query, values);
      return result.rows;
    } catch (error) {
      console.error('Error executing query', error.stack);
      throw error;
    }
  };

  


exports.fetchStationData = async (req, res) => {
    try {
        let { Date } = req.body;

        // Use current date if no dates are provided
        const currentDate = moment().format('YYYY-MM-DD');
        if (!Date) {
            Date =  currentDate;
        } 

        let data = await fetchFilteredData(Date);

        res.status(200).json({
            success: true,
            message: "Station data fetched Successfully",
            data: data
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch Station data",
            error: error.message,
        });
    }
}

exports.fetchInRangeStationdata = async(req, res) => {
    try {
        let {fromDate, toDate} = req.body;

        if(!fromDate || !toDate){
            return res.status(404).json({
                success: false,
                message: "Parameters not found"
              });
        }

        let data = await fetchFilteredData(fromDate, toDate);

        res.status(200).json({
            success: true,
            message: "Station data fetched Successfully",
            data: data
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch Station data",
            error: error.message,
        });
    }
}


// exports.updateStationData = async (req, res) => {
//     try {
//         let { station_code, date, value } = req.body;
        
//         if(station_code && date && (value||value==0) ){
//             let data = await updateStationDataQuery(station_code, date, value );

//             res.status(200).json({
//                 success: true,
//                 message: " data updated Successfully",
//             });

//         }else{
//             res.status(200).json({
//                 success: false,
//                 message: "request pearmeters are missing",
//             });
//         }



        
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({
//             success: false,
//             message: "Failed to fetch Station data",
//             error: error.message,
//         });
//     }
// }

exports.addNewStation = async (req, res) => {
    try {
        const { station_name, station_id, station_type, centre_type, centre_name, is_new_station, latitude, longitude, activation_date } = req.body;

        // Check if all required parameters are provided
        if (station_name && station_id && station_type && centre_type && centre_name && is_new_station !== undefined && latitude && longitude && activation_date) {
            // Call addNewStationQuery and get the result
            const data = await addNewStationQuery({station_name, station_id, station_type, centre_type, centre_name, is_new_station, latitude, longitude, activationdate: activation_date});
            
            // Check if the station already exists
            if (data.success == false) {
                return res.status(409).json({
                    success: data.success,
                    message: data.message,
                });
            }
            
            // If the station was added successfully
            return res.status(200).json({
                success: true,
                message: "New Station Added Successfully",
            });
        } else {
            // If any of the required parameters are missing
            return res.status(400).json({
                success: false,
                message: "Request parameters are missing",
            });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Failed to add new station details",
            error: error.message,
        });
    }
};


exports.editStation = async (req, res) => {
    try {
        const { station_id } = req.body;

        // Check if station_id is provided
        if (!station_id) {
            return res.status(400).json({
                success: false,
                message: "station_id is required",
            });
        }

        // Call editStationQuery and get the result
        const data = await editStationQuery(req.body);

        // If no rows were updated, return an error
        if (!data) {
            return res.status(404).json({
                success: false,
                message: "Station not found",
            });
        }

        // Return the updated station details
        return res.status(200).json({
            success: true,
            message: "Station updated successfully",
            data: data,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Failed to update station details",
            error: error.message,
        });
    }
};


exports.deleteStation = async (req, res) => {
    try {
        const { station_id } = req.body;

        // Check if station_id is provided
        if (!station_id) {
            return res.status(400).json({
                success: false,
                message: "station_id is required",
            });
        }

        // Call deleteStationQuery and get the result
        const data = await deleteStationQuery(station_id);

        // If no rows were deleted, return an error
        if (data.rowCount === 0) {
            return res.status(404).json({
                success: false,
                message: "Station not found",
            });
        }

        // Return success message
        return res.status(200).json({
            success: true,
            message: "Station deleted successfully",
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Failed to delete station",
            error: error.message,
        });
    }
};


exports.insertMultipleStations = async(req, res) => {
    try {       
        
        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

        const stations = sheetData.map(station => ({
            ...station,
            
            is_new_station: station.is_new_station === 'yes' ? 1 : 0
        }));

        stations.forEach((station) => {
            addNewStationQuery(station);
        })

        res.status(200).json({ 
            success : true,
            message : "Station details added successfully"
         });


        console.log({sheetData});
    } catch (error) {
        console.error("Error processing request:", error.message);
        res.status(500).json({ error: error.message });
    }
}


// exports.insertRainfallFile = async (req, res) => {
//     try {
//         const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
//         const sheetName = workbook.SheetNames[0];
//         const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

//         const formattedData = sheetData.flatMap(row => {
//             const { station_id, station_name, centre_type, ...dateData } = row;
//             const district_code = station_id.toString().substring(0, 8);

//             return Object.entries(dateData).map(([date, rainfall]) => ({
//                 station_id,
//                 district_code,
//                 date: formatDate(date),
//                 rainfall
//             }));
//         });

//         const updateQuery = `
//             UPDATE public.station_daily_data 
//             SET data = $1
//             WHERE collection_date = $2 AND station_id = $3;
//         `;
        
//         const insertQuery = `
//             INSERT INTO public.station_daily_data (station_id, district_code, collection_date, data)
//             VALUES ($1, $2, $3, $4);
//         `;

//         await Promise.all(formattedData.map(async (data) => {
//             const checkExistenceQuery = `
//                 SELECT COUNT(1) FROM public.station_daily_data 
//                 WHERE collection_date = $1 AND station_id = $2;
//             `;

//             const resExistence = await client.query(checkExistenceQuery, [data.date, data.station_id]);

//             if (resExistence.rows[0].count > 0) {
//                 await client.query(updateQuery, [data.rainfall, data.date, data.station_id]);
//             } else {
//                 await client.query(insertQuery, [data.station_id, data.district_code, data.date, data.rainfall]);
//             }
//         }));

//         res.status(200).json({
//             success: true,
//             data: formattedData,
//             message: "Rainfall details added successfully"
//         });

//     } catch (error) {
//         console.error("Error processing request:", error.message);
//         res.status(500).json({ error: error.message });
//     }
// }


// exports.verifyStationData = async (req, res) => {
//     try {
//       const { userid, date, station_id } = req.body;
  
//       if (!userid || !date || !station_id) {
//         return res.status(404).json({
//           success: false,
//           message: "Parameters not found"
//         });
//       }
  
//       const updatedRows = await verifyStationDataQuery(date, station_id, userid);
  
//       if (updatedRows.length === 0) {
//         return res.status(404).json({
//           success: false,
//           message: "No data found for the given date and station_id"
//         });
//       }
  
//       res.status(200).json({
//         success: true,
//         message: "Data verified successfully",
//         data: updatedRows[0]
//       });
  
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({
//         success: false,
//         error: error.message
//       });
//     }
// }

// exports.verifyMultipleStationData = async (req, res) => {
//     try {
//       const { userid, date, station_ids } = req.body;
  
//       if (!userid || !date || !station_ids) {
//         return res.status(404).json({
//           success: false,
//           message: "Parameters not found"
//         });
//       }
  
//       const updatedRows = await updateMultipleStations(date, station_ids, userid);
  
//       if (updatedRows.length === 0) {
//         return res.status(404).json({
//           success: false,
//           message: "No data found for the given date and station_id"
//         });
//       }
  
//       res.status(200).json({
//         success: true,
//         message: "Data verified successfully",
//         data: updatedRows
//       });
  
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({
//         success: false,
//         error: error.message
//       });
//     }
// }

exports.fetchStationLogs = async (req, res) => {
    try {
    
        const query = `
        SELECT 
          sl.station_code,
          ndd.district_name,
          sl.station_name,
          'MC RANCHI' as user_name,
          sl.log_date,
          sl.log_type
        FROM 
          public.station_logs as sl
        JOIN
          public.normal_district_details as ndd
        ON
          sl.district_code = ndd.district_code
        limit 50;
      `;
    
      const result = await client.query(query);
      res.status(200).json({
        success: true,
        message: "Station logs fetched successfully",
        data: result.rows
      });
    } catch (error) {
      console.error('Error executing query', error.stack);
      res.status(500).json({
        success: false,
        message: "Failed to fetch station logs",
        error: error.message
      });
    }
};

exports.fetchAllDatesAndDataOfStation= async (req, res) => {
    try {
        const { station_id } = req.body;
        if(!station_id){
            return res.status(500).json({
                success: false,
                message: "Station_id is missing",
              });
        }
        const query = `
            SELECT 
            collection_date,data
            FROM public.station_daily_data
            WHERE collection_date <= current_date AND station_id = $1; `;
    
      const result = await client.query(query,[station_id]);
      res.status(200).json({
        success: true,
        message: "Station Dates fetched successfully",
        data: result.rows
      });
    } catch (error) {
      console.error('Error executing query', error.stack);
      res.status(500).json({
        success: false,
        message: "Failed to fetch station dates",
        error: error.message
      });
    }
};




exports.fetchStationDataInRadius = async (req, res) => {
    try {
        let {Date, lat,long,range } = req.body;

        // Use current date if no dates are provided
        const currentDate = moment().format('YYYY-MM-DD');
        if (!Date) {
            Date =  currentDate;
        } 

        let data = await fetchFilteredDataInRange(Date,lat,long,range);

        res.status(200).json({
            success: true,
            message: "Station data fetched Successfully",
            data: data
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch Station data",
            error: error.message,
        });
    }
}

exports.fetchStationWithMaxRainfall = async (req, res) => {
    try {
        let {startDate, endDate,limit } = req.body;

        // Use current date if no dates are provided
        const currentDate = moment().format('YYYY-MM-DD');
        if (!startDate||!endDate||!limit) {
            res.status(500).json({
                success: false,
                message: "parameters are missinng",
                // error: error.message,
            });
        } 

        let data = await fetchStationWithMaxRainfallQuery(startDate,endDate,limit);

        res.status(200).json({
            success: true,
            message: "Station data fetched Successfully",
            data: data
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch Station data",
            error: error.message,
        });
    }
}

