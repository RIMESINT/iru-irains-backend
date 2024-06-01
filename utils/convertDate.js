// Function to convert date key to "YYYY-MM-DD" format
function convertDate(key) {
    const monthMapping = {
        Jan: '01',
        Feb: '02',
        Mar: '03',
        Apr: '04',
        May: '05',
        Jun: '06',
        Jul: '07',
        Aug: '08',
        Sep: '09',
        Oct: '10',
        Nov: '11',
        Dec: '12'
    };

    // Get the current year
    const currentYear = new Date().getFullYear();

    // Extract the month abbreviation and the day
    let monthAbbrev = key.slice(0, 3);
    let day = key.slice(3);

    // Format the day to ensure it's two digits
    if (day.length === 1) {
        day = '0' + day;
    }

    // Get the month number from the mapping
    let month = monthMapping[monthAbbrev];

    // Construct the date in the format "YYYY-MM-DD"
    return `${currentYear}-${month}-${day}`;
}


module.exports = convertDate;
