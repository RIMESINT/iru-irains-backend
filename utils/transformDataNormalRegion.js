const convertDate = require("./convertDate")

function transformData(data) {
    let result = [];

    data.forEach(regionData => {
        let region = regionData.REGION;
        let regionid = regionData.regionid;
        let prev = 0;

        for (let key in regionData) {
            if (key !== 'REGION' && key !== 'regionid') {
                let {date,month,day} = convertDate(key);
                // console.log({date,month,day})
                if ((day == 1) && (month == 1 || month == 3 || month == 6 || month == 10)) {
                    prev = 0
                }
                result.push({
                    region: region,
                    regionid: regionid,
                    date: date,
                    value: regionData[key],
                    rainfall_value: regionData[key] - prev
                });
                prev = regionData[key];
            }
        }
    });

    return result;
}

// Export the function
module.exports = transformData;