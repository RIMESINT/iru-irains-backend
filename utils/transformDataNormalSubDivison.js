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
        let prev = 0;

        // Iterate over each key-value pair in the rainfall data
        for (const [date, rainfall_value] of Object.entries(rainfallData)) {
            // Push the transformed record to the result array
            let { month, day} = convertDate(date)
            if ((day == 1) && (month == 1 || month == 3 || month == 6 || month == 10)) {
                prev = 0
            }
            result.push({
                subdivision_name: SUBDIVISION,
                subdivision_id: subdivid,
                subdivision_code: subdivcode,
                date: convertDate(date).date,
                value: rainfall_value,
                rainfall_value: rainfall_value - prev
            });
            prev = rainfall_value;
        }
    });

    return result;
}

module.exports = transformDataNormalSubDivision;
