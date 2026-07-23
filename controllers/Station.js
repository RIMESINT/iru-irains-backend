
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
                    JOIN public.station_daily_data_updates AS sdd
                    ON sdd.station_id = sd.station_code
                    JOIN normal_district_details AS ndd
                    ON ndd.district_code = sdd.district_code
                    WHERE sdd.collection_date BETWEEN $1 AND $2 and sdd.data != (-999.9) AND sd.flag != 0
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
        JOIN public.station_daily_data_updates AS sdd
          ON sdd.station_id = sd.station_code
        JOIN normal_district_details AS ndd
          ON ndd.district_code = sdd.district_code
        WHERE sdd.collection_date = $1 AND sd.flag != 0;
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


const addNewStationQuery = async ({station_name, station_id, station_type, centre_type, centre_name, is_new_station, latitude, longitude, activationdate, block_code, block_name}) => {
    let district_code = station_id.toString().substring(0, 8);
    let derived_block_code = block_code || station_id.toString().substring(0, 10);

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
                is_new_station, latitude, longitude, activationdate, block_code, block_name, flag
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 1);`;

        const insertValues = [district_code, station_name, station_id, station_type, centre_type, centre_name, is_new_station, latitude, longitude, activationdate, derived_block_code, block_name || null];

        const insertResult = await client.query(insertQuery, insertValues);
        addNewStationLogQuery({station_name,station_code:station_id,userid:111,action:"added"})
        return insertResult.rows;
    } catch (error) {
        console.error('Error executing query', error.stack);
        throw error;
    }
};


const updateStationQuery = async (client, {
  station_id,
  station_name,
  district_name,
  station_type,
  centre_type,
  centre_name,
  latitude,
  longitude,
  activationdate,
}) => {
  // Derive district_code from station_id (first 8 digits)
  let district_code = station_id.toString().substring(0, 8);

  // Query to check if the station exists
  const checkQuery = `SELECT station_name FROM station_details WHERE station_code = $1`;
  const checkValues = [station_id];

  try {
    // Check if station exists
    const checkResult = await client.query(checkQuery, checkValues);

    if (checkResult.rowCount === 0) {
      return {
        success: false,
        message: `Station with ID ${station_id} does not exist`,
      };
    }
 
    // // Verify station_name and district_code match
    // const existingStation = checkResult.rows[0];
    // if (existingStation.station_name !== station_name || existingStation.district_code !== district_code) {
    //   return {
    //     success: false,
    //     message: `Station name or district code mismatch for station_id ${station_id}`,
    //   };
    // }

    // Build dynamic update query for non-empty fields
    const updateFields = [];
    const updateValues = [];
    let paramCount = 1;

    if (station_type !== null && station_type !== '' && station_type !== undefined) {
      updateFields.push(`station_type = $${paramCount++}`);
      updateValues.push(station_type);
    }
    if (centre_type !== null && centre_type !== '' && centre_type !== undefined) {
      updateFields.push(`centre_type = $${paramCount++}`);
      updateValues.push(centre_type);
    }
    if (centre_name !== null && centre_name !== '' && centre_name !== undefined) {
      updateFields.push(`centre_name = $${paramCount++}`);
      updateValues.push(centre_name);
    }
    if (latitude !== null && latitude !== '' && latitude !== undefined) {
      updateFields.push(`latitude = $${paramCount++}`);
      updateValues.push(latitude);
    }
    if (longitude !== null && longitude !== '' && longitude !== undefined) {
      updateFields.push(`longitude = $${paramCount++}`);
      updateValues.push(longitude);
    }
    if (activationdate !== null && activationdate !== '' && activationdate !== undefined) {
      updateFields.push(`activationdate = $${paramCount++}`);
      updateValues.push(activationdate);
    }
    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);

    if (updateFields.length === 1) {
      // Only updated_at would be set, no changes to apply
      return {
        success: true,
        message: `No editable fields provided for station_id ${station_id}, skipped`,
      };
    }

    // Add station_code to the query parameters
    updateValues.push(station_id);

    // Constructічного

    // Construct the update query
    const updateQuery = `
      UPDATE station_details
      SET ${updateFields.join(', ')}
      WHERE station_code = $${paramCount}
    `;

    // Execute the update query
    await client.query(updateQuery, updateValues);

    // Log the update action
    addNewStationLogQuery({ station_name, station_code: station_id, userid: 111, action: "edited" });


    return {
      success: true,
      message: `Station ${station_name} (${station_id}) updated successfully`,
    };
  } catch (error) {
    console.error('Error executing query', error.stack);
    return {
      success: false,
      message: `Error updating station ${station_id}: ${error.message}`,
    };
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

    const softDeleteQuery = `
        UPDATE station_details
        SET flag = 0, updated_at = NOW()
        WHERE station_code = $1;
    `;

    try {
        // Execute the select query to get the station name
        const getResult = await client.query(getStationQuery, [station_id]);

        if (getResult.rows.length === 0) {
            return 'No station found';
        }

        const station_name = getResult.rows[0].station_name;

        // Soft delete: set flag=0 instead of hard deleting
        const deleteResult = await client.query(softDeleteQuery, [station_id]);
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
        )) <= params.radius_km AND flag != 0) AS sd

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
        const { station_name, station_id, station_type, centre_type, centre_name, is_new_station, latitude, longitude, activation_date, block_code, block_name } = req.body;

        // Check if all required parameters are provided
        if (station_name && station_id && station_type && centre_type && centre_name && is_new_station !== undefined && latitude && longitude && activation_date) {
            // Call addNewStationQuery and get the result
            const data = await addNewStationQuery({station_name, station_id, station_type, centre_type, centre_name, is_new_station, latitude, longitude, activationdate: activation_date, block_code, block_name});
            
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


exports.EditMultipleStations = async (req, res) => {
  try {
    // Start a transaction
    await client.query('BEGIN');

    // Read the Excel file from the request buffer
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    // Required columns
    const requiredColumns = [
      'district_name',
      'station_name',
      'station_id',
      'centre_type',
      'station_type',
      'latitude',
      'longitude',
      'activationdate',
    ];

    // Validate columns
    if (sheetData.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'Excel file is empty',
      });
    }

    const actualColumns = Object.keys(sheetData[0]);
    const missingColumns = requiredColumns.filter((col) => !actualColumns.includes(col));
    if (missingColumns.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: `Missing required columns: ${missingColumns.join(', ')}`,
      });
    }

    // Get valid centre names from login table
    const loginQuery = `SELECT * FROM login`; // Assuming column '1' is 'is_active'
    const loginResult = await client.query(loginQuery);
    const validCentreNames = new Set(loginResult.rows.map(row => row.name.toUpperCase()));

    // Process each station with validations
    const results = await Promise.all(
      sheetData.map(async (station, index) => {
        // Validate latitude and longitude precision
        let errors = [];
        if (station.latitude !== undefined && station.latitude !== null && station.latitude !== '') {
          const latStr = station.latitude.toString();
          const decimalMatch = latStr.match(/\.(\d+)/);
          if (!decimalMatch || decimalMatch[1].length !== 4) {
            errors.push(`Latitude must have exactly 4 decimal places (Row ${index + 2})`);
          }
        }
        if (station.longitude !== undefined && station.longitude !== null && station.longitude !== '') {
          const lngStr = station.longitude.toString();
          const decimalMatch = lngStr.match(/\.(\d+)/);
          if (!decimalMatch || decimalMatch[1].length !== 4) {
            errors.push(`Longitude must have exactly 4 decimal places (Row ${index + 2})`);
          }
        }

        // Validate activationdate format (YYYY-MM-DD)
        if (station.activationdate !== undefined && station.activationdate !== null && station.activationdate !== '') {
          const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
          if (!dateRegex.test(station.activationdate)) {
            errors.push(`Activation date must be in YYYY-MM-DD format (Row ${index + 2})`);
          } else {
            // Verify it's a valid date
            const date = new Date(station.activationdate);
            if (isNaN(date.getTime())) {
              errors.push(`Invalid activation date (Row ${index + 2})`);
            }
          }
        }

        // Validate centre_type format (MC NAME or RMC NAME) and check against login table
        if (station.centre_type !== undefined && station.centre_type !== null && station.centre_type !== '') {
          const centreTypeRegex = /^(MC|RMC) [A-Z]+$/;
          if (!centreTypeRegex.test(station.centre_type)) {
            errors.push(`Centre type must be in 'MC NAME' or 'RMC NAME' format with uppercase NAME (Row ${index + 2})`);
          } else {

            // Check if centre_type exists in login table
            if (!validCentreNames.has(station.centre_type)) {
              errors.push(`Centre type ${station.centre_type} not found in login table (Row ${index + 2})`);
            }
          }
        }

        if (errors.length > 0) {
          return {
            success: false,
            message: `Validation failed for station_id ${station.station_id}: ${errors.join('; ')}`,
          };
        }

        // Capitalize names
        const district_name = station.district_name ? station.district_name.toUpperCase() : null;
        const station_name = station.station_name ? station.station_name.toUpperCase() : null;

        // Split and capitalize centre_type and centre_name
        let centre_type = null;
        let centre_name = null;
        if (station.centre_type) {
          const [type, name] = station.centre_type.split(' ');
          centre_type = type ? type.toUpperCase() : null;
          centre_name = name ? name.toUpperCase() : null;
        }

        // Prepare station data for update
        const stationData = {
          station_id: station.station_id,
          station_name,
          district_name,
          station_type: station.station_type ? station.station_type.toUpperCase() : null,
          centre_type,
          centre_name,
          latitude: station.latitude || null,
          longitude: station.longitude || null,
          activationdate: station.activationdate || null,
        };

        // Call update function
        return await updateStationQuery(client, stationData);
      })
    );

    // Check results for success/failure
    const errors = results.filter((result) => !result.success);
    if (errors.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'Some stations could not be updated',
        errors: errors.map((e) => e.message),
      });
    }

    // Commit the transaction if all updates succeed
    await client.query('COMMIT');

    res.status(200).json({
      success: true,
      message: 'Station details updated successfully',
    });

    console.log({ sheetData });
  } catch (error) {
    // Rollback on any error
    await client.query('ROLLBACK');
    console.error('Error processing request:', error.message);
    res.status(500).json({ error: error.message });
  }
};




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





exports.fetchStationUnifiedFile = async (req, res) => {
    try {
        let { startDate, endDate, districtCodes } = req.body;

        const currentDate = moment().format('YYYY-MM-DD');
        if (!startDate) {
            startDate = currentDate;
        }
        if (!endDate) {
            endDate = currentDate;
        }

        if (!Array.isArray(districtCodes)) {
            return res.status(400).json({
                success: false,
                message: "Invalid district codes format. Expecting an array of numbers.",
            });
        }

        // Fetch filtered data using client query
        let data = await fetchFilteredStationUnifiedFile(startDate, endDate, districtCodes);

        res.status(200).json({
            success: true,
            message: "Station data fetched successfully",
            data: data,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch station data",
            error: error.message,
        });
    }
};


// created by balu on oct 22
const fetchFilteredStationUnifiedFile = async (startDate, endDate, districtCodes) => {
    try {


        // SQL Query to fetch the filtered data
        const query = `
            SELECT *
            FROM public.station_daily_data as sddf
			join station_details as sd on sd.station_code = sddf.station_id
            WHERE sddf.district_code = ANY($1)
            AND collection_date BETWEEN $2 AND $3 AND sd.flag != 0;
        `;

        // Execute the query using the client
        const result = await client.query(query, [districtCodes, startDate, endDate]);

        // Disconnect the client after query execution
        // await client.end();

        // Return the fetched data
        return result.rows;
    } catch (error) {
        console.error('Error fetching station data:', error);
        throw error;
    }
};









exports.dataActions = async (req, res) => {
    try {
        let { startDate } = req.body;

        const currentDate = moment().format('YYYY-MM-DD');
        if (!startDate) {
            startDate = currentDate;
        }


        // Fetch filtered data using client query
        let data = await dataActionsTable(startDate);

        res.status(200).json({
            success: true,
            message: "Station data fetched successfully",
            data: data,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch station data",
            error: error.message,
        });
    }
};

const dataActionsTable = async (startDate) => {

    try {
        // SQL Query to fetch the filtered data for a specific date from data_actions table
        const query = `
            SELECT *
            FROM public.data_actions
            WHERE updated_at::date = $1;
        `;
        
        // Execute the query using the client
        const result = await client.query(query, [startDate]);

        // Return the fetched data
        return result.rows;3
    } catch (error) {
        console.error('Error fetching data actions:', error);
        throw error;
    }
}




const fetchFilteredDataNWP = async (date) => {
    const query = `
        SELECT
               ndd.region_name,
               ndd.subdiv_name,
               ndd.state_name,
               ndd.district_name,
               sd.station_code,
               sd.station_name,
               sd.station_type,
               sd.centre_type,
               sd.centre_name,
               sd.latitude,
               sd.longitude,
               sdd.data as rainfall_data_in_mm
        FROM public.station_details AS sd
        JOIN public.station_daily_data_updates AS sdd
          ON sdd.station_id = sd.station_code
        JOIN normal_district_details AS ndd
          ON ndd.district_code = sdd.district_code
        WHERE sdd.collection_date = $1 AND sd.flag != 0;
      `;

    try {
      const result = await client.query(query, [date]);
      return result.rows;
    } catch (error) {
      console.error('Error executing query', error.stack);
      throw error;
    }
  };


  exports.fetchStationDataNWP = async (req, res) => {
    try {

        let { user, pass, date } = req.body;
        if(user=="IMD_NWP" && pass=="!Md@15O#nWp"){
        const effectiveDate = date || moment().format('YYYY-MM-DD');

        let data = await fetchFilteredDataNWP(effectiveDate);

        const [inactiveResult, totalResult] = await Promise.all([
          client.query(
            `SELECT COUNT(DISTINCT sd.station_code) FROM public.station_details sd
             JOIN public.station_daily_data_updates sdd ON sdd.station_id = sd.station_code
             WHERE sdd.collection_date = $1 AND sd.flag = 0`,
            [effectiveDate]
          ),
          client.query(
            `SELECT COUNT(DISTINCT sd.station_code) FROM public.station_details sd
             JOIN public.station_daily_data_updates sdd ON sdd.station_id = sd.station_code
             WHERE sdd.collection_date = $1`,
            [effectiveDate]
          )
        ]);

        res.status(200).json({
            success: true,
            message: "Station data fetched Successfully",
            note: "Only IMD stations having data",
            date: effectiveDate,
            imd_total_stations: parseInt(totalResult.rows[0].count),
            imd_stations_having_data: data.length,
            imd_inactive_stations: parseInt(inactiveResult.rows[0].count),
            data: data
        });
    }
    else{
        res.status(500).json({
            success: false,
            message: "You are not authorized to use this API",
            // data: data
        });
    }

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch Station data",
            // error: error.message,
        });
    }
}



// ── AWS-only NWP ──────────────────────────────────────────────────────────────
const fetchFilteredDataNWP_AWS = async (startDate, endDate = null) => {
  let query, values;

  if (endDate) {
    query = `
      SELECT
        min(ndd.region_name)    as region_name,
        min(ndd.subdiv_name)    as subdiv_name,
        min(ndd.state_name)     as state_name,
        min(ndd.district_name)  as district_name,
        asd.station_code        as station_code,
        min(asd.station_name)   as station_name,
        min(asd.station_type)   as station_type,
        min(asd.centre_type)    as centre_type,
        min(asd.centre_name)    as centre_name,
        min(asd.latitude)       as latitude,
        min(asd.longitude)      as longitude,
        sum(asdd.data)          as rainfall_data_in_mm
      FROM public.aws_station_details AS asd
      JOIN public.aws_station_daily_data AS asdd ON asdd.station_id = asd.station_code
      JOIN public.normal_district_details AS ndd ON ndd.district_code = asd.district_code
      WHERE asdd.collection_date BETWEEN $1 AND $2
        AND asdd.data != -999.9
        AND asd.flag != 0
      GROUP BY asd.station_code
      ORDER BY asd.station_code
    `;
    values = [startDate, endDate];
  } else {
    query = `
      SELECT
        ndd.region_name,
        ndd.subdiv_name,
        ndd.state_name,
        ndd.district_name,
        asd.station_code,
        asd.station_name,
        asd.station_type,
        asd.centre_type,
        asd.centre_name,
        asd.latitude,
        asd.longitude,
        asdd.data as rainfall_data_in_mm
      FROM public.aws_station_details AS asd
      JOIN public.aws_station_daily_data AS asdd ON asdd.station_id = asd.station_code
      JOIN public.normal_district_details AS ndd ON ndd.district_code = asd.district_code
      WHERE asdd.collection_date = $1
        AND asdd.data != -999.9
        AND asd.flag != 0
      ORDER BY asd.station_code
    `;
    values = [startDate];
  }

  try {
    const result = await client.query(query, values);
    return result.rows;
  } catch (error) {
    console.error('Error executing fetchFilteredDataNWP_AWS:', error.stack);
    throw error;
  }
};

exports.fetchStationDataNWP_AWS = async (req, res) => {
  try {
    const { user, pass } = req.body;
    if (user === 'IMD_NWP' && pass === '!Md@15O#nWp') {
      const effectiveDate = moment().format('YYYY-MM-DD');
      const data = await fetchFilteredDataNWP_AWS(effectiveDate);
      const [inactiveResult, totalResult] = await Promise.all([
        client.query(
          `SELECT COUNT(*) FROM public.aws_station_details asd
           JOIN public.aws_station_daily_data asdd ON asdd.station_id = asd.station_code
           WHERE asdd.collection_date = $1 AND asd.flag = 0`,
          [effectiveDate]
        ),
        client.query(
          `SELECT COUNT(*) FROM public.aws_station_details asd
           JOIN public.aws_station_daily_data asdd ON asdd.station_id = asd.station_code
           WHERE asdd.collection_date = $1`,
          [effectiveDate]
        )
      ]);

      return res.status(200).json({
        success: true,
        message: 'AWS station data fetched successfully',
        note: 'Only State AWS stations having data',
        date: effectiveDate,
        state_aws_total_stations: parseInt(totalResult.rows[0].count),
        state_aws_stations_having_data: data.length,
        state_aws_inactive_stations: parseInt(inactiveResult.rows[0].count),
        data
      });
    }
    res.status(401).json({ success: false, message: 'You are not authorized to use this API' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to fetch AWS station data' });
  }
};

// ── Combined (IMD + AWS) NWP ──────────────────────────────────────────────────
const fetchFilteredDataNWP_Combined = async (startDate, endDate = null) => {
  let imdQuery, awsQuery, values;

  if (endDate) {
    imdQuery = `
      SELECT
        min(ndd.region_name)   as region_name,
        min(ndd.subdiv_name)   as subdiv_name,
        min(ndd.state_name)    as state_name,
        min(ndd.district_name) as district_name,
        sd.station_code        as station_code,
        min(sd.station_name)   as station_name,
        min(sd.station_type)   as station_type,
        min(sd.centre_type)    as centre_type,
        min(sd.centre_name)    as centre_name,
        min(sd.latitude)       as latitude,
        min(sd.longitude)      as longitude,
        sum(sdd.data)          as rainfall_data_in_mm,
        'IMD'                  as source
      FROM public.station_details AS sd
      JOIN public.station_daily_data_updates AS sdd ON sdd.station_id = sd.station_code
      JOIN public.normal_district_details AS ndd ON ndd.district_code = sdd.district_code
      WHERE sdd.collection_date BETWEEN $1 AND $2 AND sdd.data != -999.9 AND sd.flag != 0
      GROUP BY sd.station_code
    `;
    awsQuery = `
      SELECT
        min(ndd.region_name)   as region_name,
        min(ndd.subdiv_name)   as subdiv_name,
        min(ndd.state_name)    as state_name,
        min(ndd.district_name) as district_name,
        asd.station_code       as station_code,
        min(asd.station_name)  as station_name,
        min(asd.station_type)  as station_type,
        min(asd.centre_type)   as centre_type,
        min(asd.centre_name)   as centre_name,
        min(asd.latitude)      as latitude,
        min(asd.longitude)     as longitude,
        sum(asdd.data)         as rainfall_data_in_mm,
        'State AWS'            as source
      FROM public.aws_station_details AS asd
      JOIN public.aws_station_daily_data AS asdd ON asdd.station_id = asd.station_code
      JOIN public.normal_district_details AS ndd ON ndd.district_code = asd.district_code
      WHERE asdd.collection_date BETWEEN $1 AND $2
        AND asd.flag != 0
      GROUP BY asd.station_code
    `;
    values = [startDate, endDate];
  } else {
    imdQuery = `
      SELECT
        ndd.region_name, ndd.subdiv_name, ndd.state_name, ndd.district_name,
        sd.station_code, sd.station_name, sd.station_type, sd.centre_type, sd.centre_name,
        sd.latitude, sd.longitude,
        sdd.data as rainfall_data_in_mm,
        'IMD'    as source
      FROM public.station_details AS sd
      JOIN public.station_daily_data_updates AS sdd ON sdd.station_id = sd.station_code
      JOIN public.normal_district_details AS ndd ON ndd.district_code = sdd.district_code
      WHERE sdd.collection_date = $1 AND sd.flag != 0
    `;
    awsQuery = `
      SELECT
        ndd.region_name, ndd.subdiv_name, ndd.state_name, ndd.district_name,
        asd.station_code, asd.station_name,
        asd.station_type, asd.centre_type, asd.centre_name,
        asd.latitude, asd.longitude,
        asdd.data as rainfall_data_in_mm,
        'State AWS' as source
      FROM public.aws_station_details AS asd
      JOIN public.aws_station_daily_data AS asdd ON asdd.station_id = asd.station_code
      JOIN public.normal_district_details AS ndd ON ndd.district_code = asd.district_code
      WHERE asdd.collection_date = $1
        AND asd.flag != 0
    `;
    values = [startDate];
  }

  try {
    const [imdResult, awsResult] = await Promise.all([
      client.query(imdQuery, values),
      client.query(awsQuery, values)
    ]);
    return [...imdResult.rows, ...awsResult.rows];
  } catch (error) {
    console.error('Error executing fetchFilteredDataNWP_Combined:', error.stack);
    throw error;
  }
};

exports.fetchStationDataNWP_Combined = async (req, res) => {
  try {
    const { user, pass } = req.body;
    if (user === 'IMD_NWP' && pass === '!Md@15O#nWp') {
      const effectiveDate = moment().format('YYYY-MM-DD');
      const data = await fetchFilteredDataNWP_Combined(effectiveDate);
      const imd_count = data.filter(r => r.source === 'IMD').length;
      const aws_count = data.filter(r => r.source === 'State AWS').length;

      const [imdInactive, awsInactive, imdTotal, awsTotal] = await Promise.all([
        client.query(
          `SELECT COUNT(*) FROM public.station_details sd
           JOIN public.station_daily_data_updates sdd ON sdd.station_id = sd.station_code
           WHERE sdd.collection_date = $1 AND sd.flag = 0`,
          [effectiveDate]
        ),
        client.query(
          `SELECT COUNT(*) FROM public.aws_station_details asd
           JOIN public.aws_station_daily_data asdd ON asdd.station_id = asd.station_code
           WHERE asdd.collection_date = $1 AND asd.flag = 0`,
          [effectiveDate]
        ),
        client.query(
          `SELECT COUNT(*) FROM public.station_details sd
           JOIN public.station_daily_data_updates sdd ON sdd.station_id = sd.station_code
           WHERE sdd.collection_date = $1`,
          [effectiveDate]
        ),
        client.query(
          `SELECT COUNT(*) FROM public.aws_station_details asd
           JOIN public.aws_station_daily_data asdd ON asdd.station_id = asd.station_code
           WHERE asdd.collection_date = $1`,
          [effectiveDate]
        )
      ]);

      const imd_total = parseInt(imdTotal.rows[0].count);
      const aws_total = parseInt(awsTotal.rows[0].count);

      return res.status(200).json({
        success: true,
        message: 'Combined IMD + AWS station data fetched successfully',
        note: 'All stations of IMD + State AWS including having no data',
        date: effectiveDate,
        total_stations: imd_total + aws_total,
        imd_total_stations: imd_total,
        state_aws_total_stations: aws_total,
        total_stations_having_data: data.length,
        imd_stations_having_data: imd_count,
        state_aws_stations_having_data: aws_count,
        total_inactive_stations: parseInt(imdInactive.rows[0].count) + parseInt(awsInactive.rows[0].count),
        imd_inactive_stations: parseInt(imdInactive.rows[0].count),
        state_aws_inactive_stations: parseInt(awsInactive.rows[0].count),
        data
      });
    }
    res.status(401).json({ success: false, message: 'You are not authorized to use this API' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to fetch combined station data' });
  }
};

exports.fetchCentreStationSummary = async (req, res) => {
  try {
      let { startDate, endDate } = req.body;

      const currentDate = moment().format('YYYY-MM-DD');
      if (!startDate && !endDate) {
          startDate = endDate = currentDate;
      } else if (!startDate) startDate = endDate;
      else if (!endDate) endDate = startDate;

      if (moment(startDate).isAfter(endDate)) {
          return res.status(400).json({
              success: false,
              message: "startDate must be <= endDate"
          });
      }

      const data = await fetchCentreStationSummaryData(startDate, endDate);

      res.status(200).json({
          success: true,
          message: "Centre station summary fetched successfully",
          data
      });

  } catch (error) {
      console.error("Error in fetchCentreStationSummary:", error);
      res.status(500).json({
          success: false,
          message: "Failed to fetch centre summary",
          error: error.message
      });
  }
};


/**
 * Fetch MC/RMC Station Summary for a date range (startDate to endDate)
 * @param {string} startDate - YYYY-MM-DD
 * @param {string} endDate   - YYYY-MM-DD
 * @returns {Promise<Array>} - Array of summary rows
 */
const fetchCentreStationSummaryData = async (startDate, endDate) => {
  const query = `
      WITH target_dates AS (
          SELECT generate_series($1::date, $2::date, '1 day'::interval)::date AS collection_date
      ),
      station_counts AS (
          SELECT
              centre_type || ' ' || centre_name AS centre,
              COUNT(*) AS total_stations
          FROM public.station_details
          WHERE flag != 0
          GROUP BY centre_type || ' ' || centre_name
      ),
      data_summary AS (
          SELECT
              sd.centre_type || ' ' || sd.centre_name AS centre,
              sdd.collection_date,
              sdd.station_id,
              MAX(CASE WHEN sdd.data <> -999.9 THEN 1 ELSE 0 END) AS is_updated,
              MAX(CASE WHEN sdd.data <> -999.9 
                       AND sdd.is_verified = 1 
                       AND sdd.verified_at IS NOT NULL THEN 1 ELSE 0 END) AS has_verified
          FROM public.station_daily_data sdd
          JOIN public.station_details sd
              ON sd.station_code = sdd.station_id AND sd.flag != 0
          JOIN target_dates td
              ON sdd.collection_date = td.collection_date
          GROUP BY sd.centre_type || ' ' || sd.centre_name, 
                   sdd.collection_date, 
                   sdd.station_id
      )
      SELECT
          ROW_NUMBER() OVER (ORDER BY ds.collection_date DESC, sc.centre) AS "S.NO",
          sc.centre AS "MC or RMC",
          ds.collection_date::text AS "DATE",
          sc.total_stations AS "TOTAL STATIONS",
          COUNT(DISTINCT CASE WHEN ds.is_updated = 1 THEN ds.station_id END) AS "UPDATED STATIONS",
          sc.total_stations - COUNT(DISTINCT CASE WHEN ds.is_updated = 1 THEN ds.station_id END) AS "NOT UPDATED STATIONS",
          COUNT(DISTINCT CASE WHEN ds.is_updated = 1 AND ds.has_verified = 1 THEN ds.station_id END) AS "VERIFIED STATIONS",
          COUNT(DISTINCT CASE WHEN ds.is_updated = 1 AND ds.has_verified = 0 THEN ds.station_id END) AS "NOT VERIFIED STATIONS"
      FROM station_counts sc
      LEFT JOIN data_summary ds 
          ON sc.centre = ds.centre
      GROUP BY sc.centre, sc.total_stations, ds.collection_date
      ORDER BY ds.collection_date DESC, sc.centre;
  `;

  try {
      const result = await client.query(query, [startDate, endDate]);
      return result.rows;
  } catch (error) {
      console.error('Error in fetchCentreStationSummaryData:', error.stack);
      throw error;
  }
};

exports.getAllStations = async (req, res) => {
  try {
    const result = await client.query(
      `SELECT station_code, station_name, station_type, centre_type, centre_name,
              latitude, longitude
       FROM public.station_details
       WHERE flag = 1
       ORDER BY station_code`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('getAllStations error', err);
    res.status(500).json({ error: 'Failed to fetch stations' });
  }
};

exports.fetchCalcModeStations = async (req, res) => {
  const { date } = req.body;
  const today = date || moment().format('YYYY-MM-DD');
  try {
    const imdQuery = `
      SELECT
        sd.station_code,
        sd.station_name,
        sd.block_code,
        sd.block_name,
        sd.district_code,
        ndd.state_name,
        ndd.district_name,
        sdd.data
      FROM public.station_details sd
      JOIN public.station_daily_data_updates sdd ON sdd.station_id = sd.station_code
      JOIN public.normal_district_details ndd ON ndd.district_code = sdd.district_code
      WHERE sdd.collection_date = $1
        AND sdd.data != -999.9
        AND sd.flag != 0
      ORDER BY sd.station_code
    `;

    const awsQuery = `
      SELECT
        asd.station_code,
        asd.station_name,
        asd.block_code,
        asd.block_name,
        asd.district_code,
        ndd.state_name,
        ndd.district_name,
        asdd.data
      FROM public.aws_station_details asd
      JOIN public.normal_district_details ndd ON ndd.district_code = asd.district_code
      JOIN public.aws_station_daily_data asdd ON asdd.station_id = asd.station_code
      WHERE asdd.collection_date = $1
        AND asdd.data >= 0
      ORDER BY asd.station_code
    `;

    const exclusionsQuery = `
      SELECT entity_type, entity_code
      FROM public.calculation_exclusions
      WHERE from_date <= $1 AND to_date >= $1
    `;

    const imdTotalQuery = `SELECT COUNT(*) AS total FROM public.station_details WHERE flag = 1`;
    const awsTotalQuery = `SELECT COUNT(*) AS total FROM public.aws_station_details`;

    const [imdResult, awsResult, imdTotalResult, awsTotalResult] = await Promise.all([
      client.query(imdQuery, [today]),
      client.query(awsQuery, [today]),
      client.query(imdTotalQuery),
      client.query(awsTotalQuery),
    ]);

    // Fetch exclusions separately — if this fails, still return station data
    let exclusions = [];
    try {
      const exclResult = await client.query(exclusionsQuery, [today]);
      exclusions = exclResult.rows;
    } catch (e) {
      console.warn('fetchCalcModeStations: exclusions query failed (table may not exist)', e.message);
    }

    // Build sets for fast lookup
    const imdExcludedStations  = new Set(exclusions.filter(e => e.entity_type === 'station').map(e => e.entity_code));
    const imdExcludedBlocks    = new Set(exclusions.filter(e => e.entity_type === 'block').map(e => e.entity_code));
    const imdExcludedDistricts = new Set(exclusions.filter(e => e.entity_type === 'district').map(e => String(e.entity_code)));
    const awsExcludedStations  = new Set(exclusions.filter(e => e.entity_type === 'aws_station').map(e => e.entity_code));
    const awsExcludedBlocks    = new Set(exclusions.filter(e => e.entity_type === 'aws_block').map(e => e.entity_code));
    const awsExcludedDistricts = new Set(exclusions.filter(e => e.entity_type === 'aws_district').map(e => String(e.entity_code)));

    const imdRows = imdResult.rows.map(r => ({
      ...r,
      is_excluded: imdExcludedStations.has(r.station_code)
        || imdExcludedBlocks.has(String(r.block_code))
        || imdExcludedDistricts.has(String(r.district_code)),
    }));

    const awsRows = awsResult.rows.map(r => ({
      ...r,
      is_excluded: awsExcludedStations.has(r.station_code)
        || awsExcludedBlocks.has(String(r.block_code))
        || awsExcludedDistricts.has(String(r.district_code)),
    }));

    res.status(200).json({
      success: true,
      date: today,
      imd: imdRows,
      aws: awsRows,
      imdTotal: parseInt(imdTotalResult.rows[0].total, 10),
      awsTotal: parseInt(awsTotalResult.rows[0].total, 10),
    });
  } catch (err) {
    console.error('fetchCalcModeStations error', err);
    res.status(500).json({ success: false, error: err.message });
  }
};




