const { jsPDF } = require('jspdf');
const { applyPlugin } = require('jspdf-autotable');
const XLSX = require('xlsx');
const moment = require('moment');

// Apply the plugin to jsPDF
applyPlugin(jsPDF);

class PDFSubdivService {
    constructor() {
        this.subdivdepCurrdate = [];
        this.regiondepCurrdate = [];
        this.subdivdepSeasondate = [];
        this.regiondepSeasondate = [];
        this.rows = [];
        this.data = null;
        this.seasonPeriodDate = null;
    }

    convertToIndianDateFormat = (dateString) => dateString.split('-').reverse().join('-');

    trimToOneDecimals = (value) => {
        if (value === null || value === undefined) return '';
        return parseFloat(value).toFixed(1);
    };

    trimToZeroDecimals = (value) => {
        if (value === null || value === undefined) return '';
        return Math.round(parseFloat(value)).toString();
    };

    getColorAndCat = (departure) => {
        if (departure == null) {
            return { color: [192, 192, 192], Cat: 'ND' };
        }

        let color = [255, 255, 255];
        let Cat = '';

        if (departure >= 60) {
            Cat = 'LE';
            color = [0, 150, 255];
        } else if (departure >= 20 && departure <= 59) {
            Cat = 'E';
            color = [50, 192, 248];
        } else if (departure >= -19 && departure <= 19) {
            Cat = 'N';
            color = [0, 205, 91];
        } else if (departure >= -59 && departure <= -20) {
            Cat = 'D';
            color = [255, 39, 0];
        } else if (departure >= -99 && departure <= -60) {
            Cat = 'LD';
            color = [255, 255, 32];
        } else if (departure == -100) {
            Cat = 'NR';
            color = [255, 255, 255];
        }

        return { color: color, Cat: Cat };
    };

    loadTheRows = () => {
        this.rows = [];
        
        const groupedByRegion = this.subdivdepCurrdate.reduce((acc, item) => {
            const region = item.region_code;
            const subdiv = item.s_code;

            if (!acc[region]) {
                acc[region] = {};
            }
            if (!acc[region][subdiv]) {
                acc[region][subdiv] = [];
            }

            acc[region][subdiv].push(item);
            return acc;
        }, {});

        const regionNames = this.regiondepCurrdate.map((x) => [x.r_code, x.name]);
        const codeToRegionNameMap = new Map(regionNames.map(([code, name]) => [code, name]));

        const sortedRegions = Object.keys(groupedByRegion).sort((a, b) => {
            const nameA = codeToRegionNameMap.get(a) || '';
            const nameB = codeToRegionNameMap.get(b) || '';
            return nameA.localeCompare(nameB);
        });

        let regionColorCode = [72, 209, 204];
        let subdivColorCode = [255, 255, 255];

        for (const regionCode of sortedRegions) {
            const regionDate = this.regiondepCurrdate.find(region => regionCode === region.r_code);
            const regionSeason = this.regiondepSeasondate.find(region => regionCode === region.r_code);

            if (!regionDate || !regionSeason) continue;

            const DateCat = this.getColorAndCat(regionDate.departure);
            const SeasonCat = this.getColorAndCat(regionSeason.departure);

            // Add Region Row
            this.rows.push([
                { content: '', styles: { fillColor: regionColorCode } },
                { content: `REGION : ${regionDate.name.toUpperCase()}`, styles: { fillColor: regionColorCode } },
                { content: regionDate.actual_rainfall != null ? this.trimToOneDecimals(regionDate.actual_rainfall) : ' ', styles: { fillColor: regionColorCode } },
                { content: this.trimToOneDecimals(parseFloat(regionDate.rainfall_normal_value)), styles: { fillColor: regionColorCode } },
                { content: regionDate.departure != null ? this.trimToZeroDecimals(regionDate.departure) : ' ', styles: { fillColor: regionColorCode } },
                { content: DateCat.Cat, styles: { fillColor: DateCat.color } },
                { content: regionSeason.actual_rainfall != null ? this.trimToOneDecimals(regionSeason.actual_rainfall) : ' ', styles: { fillColor: regionColorCode } },
                { content: this.trimToOneDecimals(parseFloat(regionSeason.rainfall_normal_value)), styles: { fillColor: regionColorCode } },
                { content: regionSeason.departure != null ? this.trimToZeroDecimals(regionSeason.departure) : ' ', styles: { fillColor: regionColorCode } },
                { content: SeasonCat.Cat, styles: { fillColor: SeasonCat.color } }
            ]);

            const subdivs = groupedByRegion[regionCode];
            const sortedSubdivs = Object.keys(subdivs).sort((a, b) => a.localeCompare(b));

            let index = 1;
            for (const subdivCode of sortedSubdivs) {
                const subdivDate = this.subdivdepCurrdate.find(subdiv => subdivCode == subdiv.s_code.toString());
                const subdivSeason = this.subdivdepSeasondate.find(subdiv => subdivCode == subdiv.s_code.toString());

                if (!subdivDate || !subdivSeason) continue;

                const DateCat = this.getColorAndCat(subdivDate.departure);
                const SeasonCat = this.getColorAndCat(subdivSeason.departure);

                // Add Subdivision Row
                this.rows.push([
                    { content: index++, styles: { fillColor: subdivColorCode } },
                    { content: `${subdivDate.subdiv_name}`, styles: { fillColor: subdivColorCode } },
                    { content: subdivDate.actual_subdiv_rainfall != null ? this.trimToOneDecimals(subdivDate.actual_subdiv_rainfall) : ' ', styles: { fillColor: subdivColorCode } },
                    { content: this.trimToOneDecimals(parseFloat(subdivDate.rainfall_normal_value)), styles: { fillColor: subdivColorCode } },
                    { content: subdivDate.departure != null ? this.trimToZeroDecimals(subdivDate.departure) : ' ', styles: { fillColor: subdivColorCode } },
                    { content: DateCat.Cat, styles: { fillColor: DateCat.color } },
                    { content: subdivSeason.actual_subdiv_rainfall != null ? this.trimToOneDecimals(subdivSeason.actual_subdiv_rainfall) : ' ', styles: { fillColor: subdivColorCode } },
                    { content: this.trimToOneDecimals(parseFloat(subdivSeason.rainfall_normal_value)), styles: { fillColor: subdivColorCode } },
                    { content: subdivSeason.departure != null ? this.trimToZeroDecimals(subdivSeason.departure) : ' ', styles: { fillColor: subdivColorCode } },
                    { content: SeasonCat.Cat, styles: { fillColor: SeasonCat.color } }
                ]);
            }
        }
    };

    generatePDF = async () => {
        const columns1 = ['', '', 
            {
                content: this.data.startDate === this.data.endDate 
                    ? `DAY: ${this.convertToIndianDateFormat(this.data.startDate)}`
                    : `DAY: ${this.convertToIndianDateFormat(this.data.startDate)} to ${this.convertToIndianDateFormat(this.data.endDate)}`, 
                colSpan: 4
            },
            {
                content: `PERIOD: ${this.convertToIndianDateFormat(this.seasonPeriodDate.startDate)} to ${this.convertToIndianDateFormat(this.seasonPeriodDate.endDate)}`, 
                colSpan: 4
            }
        ];

        const columns = ['S.No', 'REGION/SUBDIVISION', 'ACTUAL(mm)', 'NORMAL(mm)', '%DEP.', 'CAT.', 'ACTUAL(mm)', 'NORMAL(mm)', '%DEP.', 'CAT.'];

        this.loadTheRows();

        const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

        const marginLeft = 10;
        const marginTop = 10;

        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        const headingText = 'India Meteorological Department\nHydromet Division, New Delhi';
        const headingText1 = 'SUBDIVISION-WISE RAINFALL DISTRIBUTION';
        doc.text(headingText, marginLeft + 25, marginTop + 8);
        doc.text(headingText1, marginLeft + 100, marginTop + 28);

        doc.autoTable({
            head: [columns1, columns],
            body: this.rows,
            theme: 'striped',
            startY: marginTop + 33,
            margin: { left: marginLeft },
            styles: { fontSize: 7 },
            headStyles: { halign: 'center' },
            didDrawCell: function (data) {
                doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height);
                doc.setDrawColor(0);
            },
            didParseCell: function (data) {
                data.cell.styles.fontStyle = 'bold';
            }
        });

        // Add legend on second page
        const columns2 = ['', 'LEGEND', ''];
        const columns3 = ['CATEGORY', '% DEPARTURES OF RAINFALL', 'COLOUR CODE'];
        const rows2 = [
            ['Large Excess\n(LE or L.Excess)', '>= 60%', { content: '', styles: { fillColor: [0, 150, 255] } }],
            ['Excess (E)', '>= 20% and <= 59%', { content: '', styles: { fillColor: [50, 192, 248] } }],
            ['Normal (N)', '>= -19% and <= +19%', { content: '', styles: { fillColor: [0, 205, 91] } }],
            ['Deficient (D)', '>= -59% and <= -20%', { content: '', styles: { fillColor: [255, 39, 0] } }],
            ['Large Deficient\n(LD or L.Deficient)', '>= -99% and <= -60%', { content: '', styles: { fillColor: [255, 255, 32] } }],
            ['No Rain(NR)', '= -100%', { content: '', styles: { fillColor: [255, 255, 255] } }],
            ['Not Available', 'ND', { content: '', styles: { fillColor: [192, 192, 192] } }],
            ['Note : ', { content: 'The rainfall values are rounded off up to one place of decimal.', colSpan: 2 }]
        ];
        
        doc.addPage();
        doc.autoTable({
            head: [columns2, columns3],
            body: rows2,
            theme: 'striped',
            didDrawCell: function (data) {
                doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height);
                doc.setDrawColor(0);
            },
        });

        return doc;
    };

    generateExcel = () => {
        const wb = XLSX.utils.book_new();
        const ws_data = [];

        // Current date and time formatting
        const currentDate = new Date();
        const formattedDateTime = `${currentDate.getDate().toString().padStart(2, '0')}/${(currentDate.getMonth() + 1).toString().padStart(2, '0')}/${currentDate.getFullYear()}, ${currentDate.getHours().toString().padStart(2, '0')}:${currentDate.getMinutes().toString().padStart(2, '0')} ${currentDate.getHours() >= 12 ? 'pm' : 'am'}`;

        // Title and header information
        ws_data.push(['IMD Rainfall Information System - Daily Station Data']);
        ws_data.push(['']); // Empty row
        ws_data.push(['Statistics: Subdivision-wise and Regional Rainfall Distribution']);
        ws_data.push([`Selected: ${this.convertToIndianDateFormat(this.data.startDate)} to ${this.convertToIndianDateFormat(this.data.endDate)} and Season : ${this.convertToIndianDateFormat(this.seasonPeriodDate.startDate)} to ${this.convertToIndianDateFormat(this.seasonPeriodDate.endDate)}`]);
        ws_data.push([`Generated on: ${formattedDateTime}`]);
        ws_data.push(['']); // Empty row
        ws_data.push(['IMPORTANT NOTES:']);
        ws_data.push(['• All Actual and normal rainfall values are in millimeters (mm)']);
        ws_data.push(['• All Departure rainfall values are in Percentage']);
        ws_data.push(['• " "(empty) indicates no data available or not entered data']);
        ws_data.push(['• Data source: India Meteorological Department (IMD)']);
        ws_data.push(['']); // Empty row

        // Date and season labels for the data table
        const dateLabel = this.data.startDate === this.data.endDate
            ? `DAY: ${this.convertToIndianDateFormat(this.data.startDate)}`
            : `DAY: ${this.convertToIndianDateFormat(this.data.startDate)} to ${this.convertToIndianDateFormat(this.data.endDate)}`;
        const periodLabel = `PERIOD: ${this.convertToIndianDateFormat(this.seasonPeriodDate.startDate)} to ${this.convertToIndianDateFormat(this.seasonPeriodDate.endDate)}`;
        
        ws_data.push(['', '', dateLabel, '', '', '', periodLabel, '', '', '']);

        // Column headers
        ws_data.push(['S.No', 'REGION/SUBDIVISION', 'ACTUAL(mm)', 'NORMAL(mm)', '%DEP.', 'CAT.', 
                      'ACTUAL(mm)', 'NORMAL(mm)', '%DEP.', 'CAT.']);

        // Load and add the data rows
        this.loadTheRows();
        for (const row of this.rows) {
            ws_data.push(row.map(cell => (typeof cell === 'object' ? cell.content : cell)));
        }

        // Legend section
        ws_data.push([]);
        ws_data.push(['', 'LEGEND', '', '', '', '', '', '', '', '']);
        ws_data.push(['CATEGORY', '% DEPARTURES OF RAINFALL', 'COLOUR NAME', '', '', '', '', '', '', '']);
        [
            ['Large Excess (LE)', '>= 60%', 'Blue'],
            ['Excess (E)', '>= 20% and <= 59%', 'Light Blue'],
            ['Normal (N)', '>= -19% and <= +19%', 'Green'],
            ['Deficient (D)', '>= -59% and <= -20%', 'Red'],
            ['Large Deficient (LD)', '>= -99% and <= -60%', 'Yellow'],
            ['No Rain (NR)', '= -100%', 'White'],
            ['Not Available', 'ND', 'Grey'],
        ].forEach(legendRow => ws_data.push([...legendRow, '', '', '', '', '', '', '', '']));

        // Create worksheet from array of arrays
        const ws = XLSX.utils.aoa_to_sheet(ws_data);

        // Optional: Set column widths for better readability
        const colWidths = [
            { wch: 6 },   // S.No
            { wch: 35 },  // REGION/SUBDIVISION
            { wch: 12 },  // ACTUAL(mm)
            { wch: 12 },  // NORMAL(mm)
            { wch: 8 },   // %DEP.
            { wch: 6 },   // CAT.
            { wch: 12 },  // ACTUAL(mm)
            { wch: 12 },  // NORMAL(mm)
            { wch: 8 },   // %DEP.
            { wch: 6 },   // CAT.
        ];
        ws['!cols'] = colWidths;

        // Add worksheet to workbook
        XLSX.utils.book_append_sheet(wb, ws, 'Subdivision Rainfall Report');
        
        return wb;
    };

    async setData(subdivData, regionData, subdivSeasonData, regionSeasonData, dateRange, seasonPeriodDate) {
        this.subdivdepCurrdate = subdivData;
        this.regiondepCurrdate = regionData;
        this.subdivdepSeasondate = subdivSeasonData;
        this.regiondepSeasondate = regionSeasonData;
        this.data = dateRange;
        this.seasonPeriodDate = seasonPeriodDate;
    }
}

module.exports = PDFSubdivService;
