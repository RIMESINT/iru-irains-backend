
const express = require("express");
const router = express.Router();
const app = express();
const client = require("../connection");
const moment = require('moment');
const xlsx = require('xlsx');

exports.fetchStationData = async (req, res) => {
    try {
        let { Date } = req.body;

        // Use current date if no dates are provided
        const currentDate = moment().format('YYYY-MM-DD');
        if (!Date ) {
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


exports.updateStationData = async (req, res) => {
    try {
        let { station_code, date, value } = req.body;
        
        if(station_code && date && (value||value==0) ){
            let data = await updateStationDataQuery(station_code, date, value );

            res.status(200).json({
                success: true,
                message: " data updated Successfully",
            });

        }else{
            res.status(200).json({
                success: false,
                message: "request pearmeters are missing",
            });
        }



        
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch Station data",
            error: error.message,
        });
    }
}

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




const fetchFilteredData = async (Date) => {
    const query = `
                SELECT ndd.region_code,
                    ndd.region_name,
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
                    sdd.data
                FROM public.station_details AS sd
                JOIN public.station_daily_data AS sdd 
                    ON sdd.station_id = sd.station_code
                JOIN normal_district_details AS ndd 
                    ON ndd.district_code = sdd.district_code
                WHERE sdd.collection_date = $1`;

    try {
        const result = await client.query(query, [Date]);
        return result.rows;
    } catch (error) {
        console.error('Error executing query', error.stack);
        throw error;
    }
}

const updateStationDataQuery = async (station_code, date, value ) => {
    const query = `
                Update public.station_daily_data set data =$1
                WHERE collection_date = $2 and station_id = $3;`;  

    try {
        const result = await client.query(query, [value, date,station_code ]);
        return result.rows;
    } catch (error) {
        console.error('Error executing query', error.stack);
        throw error;
    }
}


const addNewStationQuery = async ({station_name, station_id, station_type, centre_type, centre_name, is_new_station, latitude, longitude, activationdate}) => {
    let district_code = station_id.toString().substring(0, 5);
    
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
    const query = `
        DELETE FROM station_details
        WHERE station_code = $1;
    `;

    try {
        // Execute the delete query
        const result = await client.query(query, [station_id]);
        return result;
    } catch (error) {
        console.error('Error executing query', error.stack);
        throw error;
    }
};

exports.insertMultipleStations = async(req, res) => {
    try {       
        
        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

        const { centre_type, centre_name} = req.body;

        const stations = sheetData.map(station => ({
            ...station,
            centre_type,
            centre_name,
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