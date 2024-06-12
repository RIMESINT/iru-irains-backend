const express = require("express");
const router = express.Router();
const app = express();
const client = require("../../../connection");
const xlsx = require("xlsx");



exports.insertStationData = async(req, res) => {
    try {
        const filename = "Rainfall_2024.xlsx"
        console.log({fileNmae:filename});
    
        // Try to read the Excel file
        const workbook = xlsx.readFile(filename);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
    
    
        // Process column data row-wise
        const columnData = {};
        jsonData[0].forEach((col, colIndex) => {
          if(col!="REGION"&&col!="MET. SUBDIVISION"&&col!="STATE"&&col!="DISTRICT"&&col!="STATION"&&col!="BLOCK"&&col!="YEAR"&&col!="Total Rain"&&col!="LAT"&&col!="LON"&&col!="No. rainy days"){
            // if(col!='REGION'){
            columnData[col] = jsonData.slice(1).map((row) => row[colIndex]);
          }
        });
    
    
    
    
    // Helper function to format date
    function formatDate(dateStr) {
      const date = new Date(`2024-${dateStr}`);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    
    // Array to store the resulting tuples
    const result = [];
    
    // Iterate over the date keys and their corresponding values
    Object.keys(columnData).forEach(dateStr => {
      // Skip the "Station_id" and "DISTRICT CODE" keys
      if (dateStr === "Station_id" || dateStr === "DISTRICT CODE") {
        return;
      }
    
      // Convert the date string to the desired format (YYYY-MM-DD)
      const formattedDate = formatDate(dateStr);
    
      // Iterate over the values and pair them with the station IDs and district codes
      columnData[dateStr].forEach((value, index) => {
        const stationId = columnData["Station_id"][index] ;
        const districtCode = columnData["DISTRICT CODE"][index] ;
        if(stationId&&districtCode)
        result.push(`(${districtCode},${stationId} , '${formattedDate}', ${value??-999.9} )`);
      });
    });

    const queryText = "INSERT INTO station_daily_data (district_code ,station_id, collection_date, data) VALUES ";
    const truncateQuery = "TRUNCATE TABLE  public.station_daily_data";
    const new_query = queryText + result.join(", ") + ";";
    await client.query(truncateQuery);
    await client.query(new_query);

    res.status(200).json({ message: "Data Inserted Successfully" });
    
    
      } catch (error) {
        console.error("Error processing request:", error.message);
        res.status(500).json({ error: error.message });
      }
  
    
        // insert_query = insert_query.slice(0, -1);
        // await client.query("CREATE TABLE IF NOT EXISTS public.normal_country ( id SERIAL PRIMARY KEY, date DATE NOT NULL, country_name VARCHAR(255) NOT NULL, cumulative_rainfall_value NUMERIC(10, 2) NOT NULL, rainfall_value NUMERIC(10, 2) NOT NULL )");
        // await client.query(" TRUNCATE TABLE  public.normal_country");
        

}