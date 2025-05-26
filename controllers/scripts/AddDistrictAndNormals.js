const express = require("express");
const router = express.Router();
const app = express();
const client = require("../../connection");
const xlsx = require("xlsx");
const convertDate = require("../../utils/convertDate");



//     // Helper function to format date
function formatDate(dateStr) {
    const date = new Date(`2025-${dateStr}`);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return {
      year: year,
      month: month,
      day: day,
      date : `${year}-${month}-${day}`,
  }
  }
      


exports.insertStationDataFtpzx = async(req, res) => {
    try {

        createStationDailyDataTable(); 
        
        // const filename = "Rainfall_2024.xlsx"
        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    
        // Try to read the Excel file
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

    const queryText = "INSERT INTO station_daily_data_ftp (district_code ,station_id, collection_date, data) VALUES ";
    // const queryText1 = "INSERT INTO station_daily_data (district_code ,station_id, collection_date, data) VALUES ";
    const truncateQuery = "TRUNCATE TABLE  public.station_daily_data_ftp";
    // const truncateQuery1 = "TRUNCATE TABLE  public.station_daily_data";
    const new_query = queryText + result.join(", ") + ";";
    // const new_query1 = queryText1 + result.join(", ") + ";";
    await client.query(truncateQuery);
    // await client.query(truncateQuery1);
    await client.query(new_query);
    // await client.query(new_query1);

    res.status(200).json({ message: "Data Inserted Successfully" });
    
    
      } catch (error) {
        console.error("Error processing request:", error.message);
        res.status(500).json({ error: error.message });
      }
  
    
        // insert_query = insert_query.slice(0, -1);
        // await client.query("CREATE TABLE IF NOT EXISTS public.normal_country ( id SERIAL PRIMARY KEY, date DATE NOT NULL, country_name VARCHAR(255) NOT NULL, cumulative_rainfall_value NUMERIC(10, 2) NOT NULL, rainfall_value NUMERIC(10, 2) NOT NULL )");
        // await client.query(" TRUNCATE TABLE  public.normal_country");
        

}

// exports.inserNewDistrictAndNormalValues = async(req, res) => {
//      // const filename = "Rainfall_2024.xlsx"
//      const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    
//      // Try to read the Excel file
//      const sheetName = workbook.SheetNames[0];
//      const worksheet = workbook.Sheets[sheetName];
//      const jsonData = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
 
 
//         // Process column data row-wise
//         const columnData = {};
//         jsonData[0].forEach((col, colIndex) => {
//             columnData[col] = jsonData.slice(1).map((row) => row[colIndex]);
//         });

//     // Array to store the resulting tuples
//     const result = [];
    
//     // Iterate over the date keys and their corresponding values
//     Object.keys(columnData).forEach(dataStr => {
//       // Skip the "Station_id" and "DISTRICT CODE" keys
//     //   if (dataStr === "district_code" || dataStr === "district_name"|| dataStr === "district_area") {
//     //     // return;
//     //     // if(dataStr === "district_code"){
//     //         columnData[dataStr].forEach((value, index) => {
//     //             console.log(value,index);

//     //         })
//     //     // }
//     //     return
//     //   }
    
//       // Convert the date string to the desired format (YYYY-MM-DD)
//       const formattedDate = formatDate(dataStr);
//     //   console.log(columnData["district_code"])

    
//     //   Iterate over the values and pair them with the station IDs and district codes
//       columnData[dataStr].forEach((value, index) => {
//         const district_code = columnData["district_code"][index] ;
//         const district_name = columnData["district_name"][index] ;
//         const district_area = columnData["district_area"][index]??null ;
//         if(district_code&&district_name&&district_area)
//             console.log(formattedDate,value)
//         // result.push(`(${districtCode},${stationId} , '${formattedDate}', ${value??-999.9} )`);

//       });
//     });
// }


exports.inserNewDistrictAndNormalValues = async (req, res) => {
  try {
      // Read the Excel file from the uploaded buffer
      const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const rows = xlsx.utils.sheet_to_json(worksheet);

      await client.query('BEGIN');  // Start transaction

      // ✅ Update the sequence before any inserts
      await client.query(`
      SELECT setval('normal_district_id_seq', (SELECT MAX(id) FROM normal_district));
      `);

      for (const row of rows) {
          // Step 1: Insert district information
          const infoId = await insertDistrict(row.district_name, row.district_code, row.district_area);

          // Step 2: Prepare and insert date-wise data into the 'normal_district' table
          let insertQuery = "INSERT INTO normal_district (date, cumulative_rainfall_value, rainfall_value, normal_district_details_id) VALUES ";
          let prev = 0;

          for (const [key, value] of Object.entries(row)) {
              if (key !== "district_code" && key !== "district_name" && key !== "district_area") {
                  const { month, date, year, day } = formatDate(key);

                  if (day === 1 && (month === 1 || month === 3 || month === 6 || month === 10)) {
                      prev = 0;  // Reset cumulative value quarterly
                  }

                  insertQuery += `('${date}', ${value}, ${value - prev}, ${infoId}),`;
                  prev = value;
              }
          }

          // Remove last comma and execute the query
          console.log('Before',insertQuery)
          insertQuery = insertQuery.slice(0, -1);
          console.log('After',insertQuery);
          await client.query(insertQuery);
      }

      await client.query('COMMIT');  // Commit transaction
      console.log("Data insertion completed.");
      res.status(200).json({ message: "Data insertion completed successfully." });
      
  } catch (error) {
      await client.query('ROLLBACK');  // Rollback transaction on error
      console.error("Error during data insertion:", error);
      res.status(500).json({ error: "Data insertion failed." });
  }
};


const insertDistrict = async (d_name,d_code,d_area) =>{
  const strValue = d_code.toString();
  const subdiv = parseInt(strValue.slice(0, 3), 10);
  const state = parseInt(strValue[0] + strValue[3] + strValue[4], 10);

  const insertInfoText = `INSERT INTO normal_district_details (
                        district_code,
                        district_name,
                        district_area,
                        ddd,
                        region_name,
                        region_code,
                        state_code,
                        new_state_code,
                        state_name,
                        rst,
                        subdiv_code,
                        subdiv_name,
                        sd,
                        subdiv_weight
                    )
                    SELECT 
                        $1 AS district_code,      
                        $2 AS district_name,
                        $3 AS district_area,
                        $4 AS ddd,
                        nd1.region_name,
                        nd1.region_code,
                        nd1.state_code,
                        nd1.new_state_code,
                        nd1.state_name,
                        nd1.rst,
                        nd2.subdiv_code,
                        nd2.subdiv_name,
                        nd2.sd,
                        nd2.subdiv_weight
                    FROM 
                        (SELECT region_name, region_code, state_code, new_state_code, state_name, rst 
                        FROM normal_district_details 
                        WHERE new_state_code = $5 
                        LIMIT 1) AS nd1
                    CROSS JOIN 
                        (SELECT subdiv_code, subdiv_name, sd, subdiv_weight 
                        FROM normal_district_details 
                        WHERE subdiv_code = $6
                        LIMIT 1) AS nd2
                    RETURNING id;
                  `

//   const insertInfoText = `
//   INSERT INTO info (district_code, district_name, district_area)
//   VALUES ($1, $2, $3) RETURNING info_id
// `;

const infoResult = await client.query(insertInfoText, [
  d_code,
  d_name,
  d_area,
  parseInt(strValue.slice(-3), 10),
  state,subdiv
]);
console.log("id ",infoResult.rows[0].id)
return infoResult.rows[0].id;
}