const convertDate = require("./convertDate")

function transformDataNormalDistrict(data) {
    let result = [];

    // Iterate over each row of the input data
    data.forEach(row => {
        const {
            region_name,
            region_code,
            subdiv_name,
            sd,
            subdiv_code,
            state_name,
            rst,
            state_code,
            district_name,
            ddd,
            district_code,
            ...rainfallData // Extract the rainfall data for each day
        } = row;

        // Iterate over each key-value pair in the rainfall data
        for (const [date, value] of Object.entries(rainfallData)) {
            // Construct the date in the format "YYYY-MM-DD"
            const formattedDate = convertDate(date);

            // Push the transformed record to the result array
            result.push({
                date: formattedDate,
                region_name: region_name,
                region_code: region_code,
                subdiv_name: subdiv_name,
                sd: sd,
                subdiv_code: subdiv_code,
                state_name: state_name,
                rst: rst,
                state_code: state_code,
                district_name: district_name,
                ddd: ddd,
                district_code: district_code,
                rainfall_value: value
            });
        }
    });

    return result;
}


module.exports = transformDataNormalDistrict;
