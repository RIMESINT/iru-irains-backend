const convertDate = require("./convertDate")

function transformData(data) {
    let result = [];

    data.forEach(regionData => {
        let region = regionData.REGION;
        let regionid = regionData.regionid;

        for (let key in regionData) {
            if (key !== 'REGION' && key !== 'regionid') {
                let date = convertDate(key);
                result.push({
                    region: region,
                    regionid: regionid,
                    date: date,
                    value: regionData[key]
                });
            }
        }
    });

    return result;
}

// Export the function
module.exports = transformData;
