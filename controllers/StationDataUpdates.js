
const express = require("express");
const router = express.Router();
const app = express();
const client = require("../connection");
const moment = require('moment');
const xlsx = require('xlsx');



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
        JOIN public.station_daily_data_updates AS sdd 
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

const updateStationDataQuery = async (station_code, date, value ) => {
    const query = `
                Update public.station_daily_data_updates set data =$1, updated_at =now()
                WHERE collection_date = $2 and station_id = $3;`;  

    try {
        const result = await client.query(query, [value, date,station_code ]);
        return result.rows;
    } catch (error) {
        console.error('Error executing query', error.stack);
        throw error;
    }
}






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
      UPDATE public.station_daily_data_updates
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
      UPDATE public.station_daily_data_updates
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




exports.fetchStationDataNew = async (req, res) => {
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

exports.fetchInRangeStationdataNew = async(req, res) => {
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





exports.insertRainfallFile = async (req, res) => {
    try {
        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

        const formattedData = sheetData.flatMap(row => {
            const { station_id, station_name, centre_type, ...dateData } = row;
            const district_code = station_id.toString().substring(0, 8);

            return Object.entries(dateData).map(([date, rainfall]) => ({
                station_id,
                district_code,
                date: formatDate(date),
                rainfall:rainfall??-999.9
            }));
        });

        const upsertQuery = `
            INSERT INTO public.station_daily_data_updates (station_id, district_code, collection_date, data)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (station_id, collection_date)
            DO UPDATE SET data = EXCLUDED.data;
        `;

        const values = formattedData.map(data => [
            data.station_id,
            data.district_code,
            data.date,
            data.rainfall
        ]);

        // Use a transaction to batch the operations
        await client.query('BEGIN');
        for (const value of values) {
            await client.query(upsertQuery, value);
        }
        await client.query('COMMIT');

        res.status(200).json({
            success: true,
            data: formattedData,
            message: "Rainfall details added successfully"
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Error processing request:", error.message);
        res.status(500).json({ error: error.message });
    }
}


exports.verifyStationData = async (req, res) => {
    try {
      const { userid, date, station_id } = req.body;
  
      if (!userid || !date || !station_id) {
        return res.status(404).json({
          success: false,
          message: "Parameters not found"
        });
      }
  
      const updatedRows = await verifyStationDataQuery(date, station_id, userid);
  
      if (updatedRows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No data found for the given date and station_id"
        });
      }
  
      res.status(200).json({
        success: true,
        message: "Data verified successfully",
        data: updatedRows[0]
      });
  
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
}

exports.verifyMultipleStationData = async (req, res) => {
    try {
      const { userid, date, station_ids } = req.body;
  
      if (!userid || !date || !station_ids) {
        return res.status(404).json({
          success: false,
          message: "Parameters not found"
        });
      }
  
      const updatedRows = await updateMultipleStations(date, station_ids, userid);
  
      if (updatedRows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No data found for the given date and station_id"
        });
      }
  
      res.status(200).json({
        success: true,
        message: "Data verified successfully",
        data: updatedRows
      });
  
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
}


////////////////////////////////////////////////////////////////////////////////////////


exports.AddDailyStationData = async (req, res) => {
    try {

        await removePrevData();
        await copyDataFromUpdatesToStationDailyData();
        
      res.status(200).json({
        success: true,
        message: "Data verified successfully",
        // data: updatedRows
      });
  
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
}


const removePrevData = async () => {
    try {
        const deleteQueryForTemp = `
        DELETE FROM public.station_daily_data_updates
        WHERE collection_date < CURRENT_DATE - INTERVAL '31 days';
        `;

        const deleteQueryStationDailyData = `
        DELETE FROM public.station_daily_data
        WHERE collection_date >= CURRENT_DATE - INTERVAL '31 days';
        `;

        await client.query(deleteQueryForTemp);
        await client.query(deleteQueryStationDailyData);
        return "success"

    } catch (error) {
      console.error(error);
      throw new Error(error.message);
    }
    

    
}


const copyDataFromUpdatesToStationDailyData = async () => {
    try {
        const copyQuery = `
            INSERT INTO public.station_daily_data (collection_date, data, station_id, district_code, created_at, updated_at, is_verified, verified_by, verified_at)
            SELECT collection_date, data, station_id, district_code, created_at, updated_at, is_verified, verified_by, verified_at
            FROM public.station_daily_data_updates
            WHERE collection_date >= CURRENT_DATE - INTERVAL '31 days';
        `;

        await client.query(copyQuery);
        return "success"

    } catch (error) {
      console.error(error);
      throw new Error(error.message);
    }

}