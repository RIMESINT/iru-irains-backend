const convertDate = require("./convertDate")

function transformDataNormalSubDivision(data) {
    let result = [];

    // Iterate over each row of the input data
    data.forEach(row => {
        const {
            SUBDIVISION,
            subdivid,
            subdivcode,
            ...rainfallData // Extract the rainfall data for each day
        } = row;

        // Iterate over each key-value pair in the rainfall data
        for (const [date, rainfall_value] of Object.entries(rainfallData)) {
            // Push the transformed record to the result array
            result.push({
                subdivision_name: SUBDIVISION,
                subdivision_id: subdivid,
                subdivision_code: subdivcode,
                date: convertDate(date),
                rainfall_value: rainfall_value
            });
        }
    });

    return result;
}

module.exports = transformDataNormalSubDivision;
