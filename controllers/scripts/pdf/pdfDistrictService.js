const { jsPDF } = require('jspdf');
const { applyPlugin } = require('jspdf-autotable');
const XLSX = require('xlsx');
const moment = require('moment');
const fs = require('fs');
const path = require('path');
applyPlugin(jsPDF);


class PDFDistrictService {
    constructor() {
        this.districtdepCurrdate = [];
        this.statedepCurrdate = [];
        this.subdivdepCurrdate = [];
        this.districtdepSeasondate = [];
        this.statedepSeasondate = [];
        this.subdivdepSeasondate = [];
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
            return {
                color: [192, 192, 192], // #c0c0c0
                Cat: 'ND'
            };
        }

        let color = [255, 255, 255];
        let Cat = '';

        if (departure >= 60) {
            Cat = 'LE';
            color = [0, 150, 255]; // #0096ff
        } else if (departure >= 20 && departure <= 59) {
            Cat = 'E';
            color = [50, 192, 248]; // #32c0f8
        } else if (departure >= -19 && departure <= 19) {
            Cat = 'N';
            color = [0, 205, 91]; // #00cd5b
        } else if (departure >= -59 && departure <= -20) {
            Cat = 'D';
            color = [255, 39, 0]; // #ff2700
        } else if (departure >= -99 && departure <= -60) {
            Cat = 'LD';
            color = [255, 255, 32]; // #ffff20
        } else if (departure == -100) {
            Cat = 'NR';
            color = [255, 255, 255]; // #ffffff
        }

        return {
            color: color,
            Cat: Cat
        };
    };

    getSeason = (startDate) => {
        if (!(startDate instanceof Date)) {
            startDate = new Date(startDate);
        }
        
        if (isNaN(startDate.getTime())) {
            throw new Error("Invalid date format provided to getSeason");
        }
    
        const month = startDate.getMonth();
    
        if (month >= 0 && month <= 1) {
            return 'Jan-Feb';
        } else if (month >= 2 && month <= 4) {
            return 'Mar-May';
        } else if (month >= 5 && month <= 8) {
            return 'Jun-Sep';
        } else if (month >= 9 && month <= 11) {
            return 'Oct-Dec';
        }
        return '';
    };

    parseDate = (date) => {
        if (date instanceof Date && !isNaN(date.getTime())) {
            return date;
        }
        
        if (typeof date === 'string') {
            const datePattern = /^\d{4}-\d{2}-\d{2}$/;
            if (datePattern.test(date)) {
                return new Date(date);
            }
        }
    
        throw new Error("Invalid date format");
    };

    formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    adjustSeasonForRange = (startDate, endDate) => {
        startDate = this.parseDate(startDate);
        endDate = this.parseDate(endDate);
    
        const season = this.getSeason(startDate);
    
        let seasonStartDate;
        let seasonEndDate;
    
        switch (season) {
            case 'Jan-Feb':
                seasonStartDate = new Date(startDate.getFullYear(), 0, 1);
                seasonEndDate = new Date(startDate.getFullYear(), 1, 28);
                break;
            case 'Mar-May':
                seasonStartDate = new Date(startDate.getFullYear(), 2, 1);
                seasonEndDate = new Date(startDate.getFullYear(), 4, 31);
                break;
            case 'Jun-Sep':
                seasonStartDate = new Date(startDate.getFullYear(), 5, 1);
                seasonEndDate = new Date(startDate.getFullYear(), 8, 30);
                break;
            case 'Oct-Dec':
                seasonStartDate = new Date(startDate.getFullYear(), 9, 1);
                seasonEndDate = new Date(startDate.getFullYear(), 11, 31);
                break;
            default:
                seasonStartDate = startDate;
                seasonEndDate = endDate;
        }

        if (seasonEndDate > new Date()) {
            seasonEndDate = new Date();
        }
    
        return {
            season,
            startDate: this.formatDate(seasonStartDate),
            endDate: this.formatDate(seasonEndDate),
        };
    };

    loadTheRows = () => {
        this.rows = [];
        
        const groupedBySubDivision = this.districtdepCurrdate.reduce((acc, item) => {
            const subDivision = item.sub_division_code;
            const state = item.state_code;

            if (!acc[subDivision]) {
                acc[subDivision] = {};
            }

            if (!acc[subDivision][state]) {
                acc[subDivision][state] = [];
            }
            
            acc[subDivision][state].push(item);
            return acc;
        }, {});

        const subdivNames = this.subdivdepCurrdate.map((x) => [x.s_code, x.subdiv_name]);
        const codeToNameMap = new Map(subdivNames.map(([code, name]) => [code, name]));
        const sortedSubDivisions = Object.keys(groupedBySubDivision).sort((a, b) => {
            const nameA = codeToNameMap.get(a) || '';
            const nameB = codeToNameMap.get(b) || '';
            return nameA.localeCompare(nameB);
        });

        let subdivColorCode = [72, 209, 204];
        let stateColorCode = [238, 130, 238];

        for (const subDivCode of sortedSubDivisions) {
            const subdivisionDate = this.subdivdepCurrdate.find(subdiv => subDivCode === subdiv.s_code);
            const subdivisionSeason = this.subdivdepSeasondate.find(subdiv => subDivCode === subdiv.s_code);

            if (!subdivisionDate || !subdivisionSeason) continue;

            const DateCat = this.getColorAndCat(subdivisionDate.departure);
            const SeasonCat = this.getColorAndCat(subdivisionSeason.departure);

            this.rows.push([
                { content: '', styles: { fillColor: subdivColorCode } },
                { content: `SUBDIVISION : ${subdivisionDate.subdiv_name}`, styles: { fillColor: subdivColorCode } },
                { content: subdivisionDate.actual_subdiv_rainfall != null ? this.trimToOneDecimals(subdivisionDate.actual_subdiv_rainfall) : ' ', styles: { fillColor: subdivColorCode } },
                { content: this.trimToOneDecimals(parseFloat(subdivisionDate.rainfall_normal_value)), styles: { fillColor: subdivColorCode } },
                { content: subdivisionDate.departure != null ? this.trimToZeroDecimals(subdivisionDate.departure) : ' ', styles: { fillColor: subdivColorCode } },
                { content: DateCat.Cat, styles: { fillColor: DateCat.color } },
                { content: subdivisionSeason.actual_subdiv_rainfall != null ? this.trimToOneDecimals(subdivisionSeason.actual_subdiv_rainfall) : ' ', styles: { fillColor: subdivColorCode } },
                { content: this.trimToOneDecimals(parseFloat(subdivisionSeason.rainfall_normal_value)), styles: { fillColor: subdivColorCode } },
                { content: subdivisionSeason.departure != null ? this.trimToZeroDecimals(subdivisionSeason.departure) : ' ', styles: { fillColor: subdivColorCode } },
                { content: SeasonCat.Cat, styles: { fillColor: SeasonCat.color } }
            ]);

            const states = groupedBySubDivision[subDivCode];
            const sortedStates = Object.keys(states).sort((a, b) => a.localeCompare(b));

            for (const stateCode of sortedStates) {
                const stateDate = this.statedepCurrdate.find(state => stateCode == state.state_code.toString());
                const stateSeason = this.statedepSeasondate.find(state => stateCode == state.state_code.toString());

                if (!stateDate || !stateSeason) continue;

                const DateCat = this.getColorAndCat(stateDate.departure);
                const SeasonCat = this.getColorAndCat(stateSeason.departure);

                this.rows.push([
                    { content: '', styles: { fillColor: stateColorCode } },
                    { content: `STATE : ${stateDate.state_name}`, styles: { fillColor: stateColorCode } },
                    { content: stateDate.actual_state_rainfall != null ? this.trimToOneDecimals(stateDate.actual_state_rainfall) : ' ', styles: { fillColor: stateColorCode } },
                    { content: this.trimToOneDecimals(parseFloat(stateDate.rainfall_normal_value)), styles: { fillColor: stateColorCode } },
                    { content: stateDate.departure != null ? this.trimToZeroDecimals(stateDate.departure) : ' ', styles: { fillColor: stateColorCode } },
                    { content: DateCat.Cat, styles: { fillColor: DateCat.color } },
                    { content: stateSeason.actual_state_rainfall != null ? this.trimToOneDecimals(stateSeason.actual_state_rainfall) : ' ', styles: { fillColor: stateColorCode } },
                    { content: this.trimToOneDecimals(parseFloat(stateSeason.rainfall_normal_value)), styles: { fillColor: stateColorCode } },
                    { content: stateSeason.departure != null ? this.trimToZeroDecimals(stateSeason.departure) : ' ', styles: { fillColor: stateColorCode } },
                    { content: SeasonCat.Cat, styles: { fillColor: SeasonCat.color } }
                ]);

                const districtsCurrDate = states[stateCode];
                const sortedDistrictsCurrDate = districtsCurrDate.sort((a, b) => a.district_name.localeCompare(b.district_name));

                for (let i = 0; i < sortedDistrictsCurrDate.length; i++) {
                    const districtDate = sortedDistrictsCurrDate[i];
                    const districtSeason = this.districtdepSeasondate.find(district => district.district_code == districtDate.district_code);

                    const DateCat = this.getColorAndCat(districtDate.departure);
                    const SeasonCat = this.getColorAndCat(districtSeason?.departure);

                    this.rows.push([
                        i + 1,
                        districtDate.district_name,
                        districtDate.actual_rainfall != null ? this.trimToOneDecimals(districtDate.actual_rainfall) : ' ',
                        this.trimToOneDecimals(parseFloat(districtDate.normal_rainfall)),
                        districtDate.departure != null ? this.trimToZeroDecimals(districtDate.departure) : ' ',
                        { content: DateCat.Cat, styles: { fillColor: DateCat.color } },
                        districtSeason?.actual_rainfall != null ? this.trimToOneDecimals(districtSeason.actual_rainfall) : ' ',
                        this.trimToOneDecimals(parseFloat(districtSeason?.normal_rainfall || 0)),
                        districtSeason?.departure != null ? this.trimToZeroDecimals(districtSeason.departure) : ' ',
                        { content: SeasonCat.Cat, styles: { fillColor: SeasonCat.color } }
                    ]);
                }
            }
        }
    };

    generatePDF = async () => {
        const seasonRange = this.adjustSeasonForRange(this.data.startDate, this.data.endDate);
        this.seasonPeriodDate.startDate = seasonRange.startDate;
        this.seasonPeriodDate.endDate = seasonRange.endDate;

        const columns1 = ['', '', 
            {
                content: this.data.startDate === this.data.endDate ? 
                    `DAY: ${this.convertToIndianDateFormat(this.data.startDate)}` : 
                    `DAY: ${this.convertToIndianDateFormat(this.data.startDate)} to ${this.convertToIndianDateFormat(this.data.endDate)}`, 
                colSpan: 4
            },
            {
                content: `PERIOD: ${this.convertToIndianDateFormat(this.seasonPeriodDate.startDate)} to ${this.convertToIndianDateFormat(this.seasonPeriodDate.endDate)}`, 
                colSpan: 4
            }
        ];

        const columns = ['S.No', 'MET.SUBDIVISION/UT/STATE/DISTRICT', 'ACTUAL(mm)', 'NORMAL(mm)', '%DEP.', 'CAT.', 'ACTUAL(mm)', 'NORMAL(mm)', '%DEP.', 'CAT.'];

        this.loadTheRows();

        const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

        const marginLeft = 10;
        const marginTop = 10;

        // Add logos (you'll need to convert these to base64 or use local files)
        // doc.addImage(imgData150, 'PNG', imgX, marginTop, 15, 20);
        // doc.addImage(imgData, 'PNG', marginLeft, marginTop, 15, 20);

        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        const headingText = 'India Meteorological Department\nHydromet Division, New Delhi';
        const headingText1 = 'DISTRICT RAINFALL DISTRIBUTION';
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
    
        // Header rows as in the PDF
        const seasonRange = this.adjustSeasonForRange(this.data.startDate, this.data.endDate);
        const seasonLabel = `PERIOD: ${this.convertToIndianDateFormat(seasonRange.startDate)} to ${this.convertToIndianDateFormat(seasonRange.endDate)}`;
        const dateLabel = this.data.startDate === this.data.endDate ?
            `DAY: ${this.convertToIndianDateFormat(this.data.startDate)}` :
            `DAY: ${this.convertToIndianDateFormat(this.data.startDate)} to ${this.convertToIndianDateFormat(this.data.endDate)}`;
        ws_data.push(['', '', dateLabel, '', '', '', seasonLabel, '', '', '']);
    
        ws_data.push(['S.No', 'MET.SUBDIVISION/UT/STATE/DISTRICT', 'ACTUAL(mm)', 'NORMAL(mm)', '%DEP.', 'CAT.',
                      'ACTUAL(mm)', 'NORMAL(mm)', '%DEP.', 'CAT.']);
    
        this.loadTheRows();
    
        // Helper: flatten row data for Excel cells (Cell content or value)
        for (const row of this.rows) {
            ws_data.push(row.map(cell => (typeof cell === 'object' ? cell.content : cell)));
        }
    
        // Legend
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
    
        // Sheet creation
        const ws = XLSX.utils.aoa_to_sheet(ws_data);
        XLSX.utils.book_append_sheet(wb, ws, 'Rainfall Report');
        return wb;
    }
    

    async setData(districtData, stateData, subdivData, districtSeasonData, stateSeasonData, subdivSeasonData, dateRange, seasonPeriodDate) {
        this.districtdepCurrdate = districtData;
        this.statedepCurrdate = stateData;
        this.subdivdepCurrdate = subdivData;
        this.districtdepSeasondate = districtSeasonData;
        this.statedepSeasondate = stateSeasonData;
        this.subdivdepSeasondate = subdivSeasonData;
        this.data = dateRange;
        this.seasonPeriodDate = seasonPeriodDate;
    }
}

module.exports = PDFDistrictService;
