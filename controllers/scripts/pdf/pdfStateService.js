const { jsPDF } = require('jspdf');
const { applyPlugin } = require('jspdf-autotable');
const XLSX = require('xlsx');
const moment = require('moment');

// Apply the plugin to jsPDF
applyPlugin(jsPDF);

class PDFStateService {
    constructor() {
        this.statedepCurrdate = [];
        this.regiondepCurrdate = [];
        this.statedepSeasondate = [];
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
        
        const groupedByRegion = this.statedepCurrdate.reduce((acc, item) => {
            const region = item.region_code;
            const state = item.state_code;

            if (!acc[region]) {
                acc[region] = {};
            }
            if (!acc[region][state]) {
                acc[region][state] = [];
            }
            
            acc[region][state].push(item);
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
        let stateColorCode = [255, 255, 255];

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

            const states = groupedByRegion[regionCode];
            const sortedStates = Object.keys(states).sort((a, b) => a.localeCompare(b));

            let index = 1;
            for (const stateCode of sortedStates) {
                const stateDate = this.statedepCurrdate.find(state => stateCode == state.state_code.toString());
                const stateSeason = this.statedepSeasondate.find(state => stateCode == state.state_code.toString());

                if (!stateDate || !stateSeason) continue;

                const DateCat = this.getColorAndCat(stateDate.departure);
                const SeasonCat = this.getColorAndCat(stateSeason.departure);

                // Add State Row
                this.rows.push([
                    { content: index++, styles: { fillColor: stateColorCode } },
                    { content: `${stateDate.state_name}`, styles: { fillColor: stateColorCode } },
                    { content: stateDate.actual_state_rainfall != null ? this.trimToOneDecimals(stateDate.actual_state_rainfall) : ' ', styles: { fillColor: stateColorCode } },
                    { content: this.trimToOneDecimals(parseFloat(stateDate.rainfall_normal_value)), styles: { fillColor: stateColorCode } },
                    { content: stateDate.departure != null ? this.trimToZeroDecimals(stateDate.departure) : ' ', styles: { fillColor: stateColorCode } },
                    { content: DateCat.Cat, styles: { fillColor: DateCat.color } },
                    { content: stateSeason.actual_state_rainfall != null ? this.trimToOneDecimals(stateSeason.actual_state_rainfall) : ' ', styles: { fillColor: stateColorCode } },
                    { content: this.trimToOneDecimals(parseFloat(stateSeason.rainfall_normal_value)), styles: { fillColor: stateColorCode } },
                    { content: stateSeason.departure != null ? this.trimToZeroDecimals(stateSeason.departure) : ' ', styles: { fillColor: stateColorCode } },
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

        const columns = ['S.No', 'REGION/STATE', 'ACTUAL(mm)', 'NORMAL(mm)', '%DEP.', 'CAT.', 'ACTUAL(mm)', 'NORMAL(mm)', '%DEP.', 'CAT.'];

        this.loadTheRows();

        const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

        const marginLeft = 10;
        const marginTop = 10;

        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        const headingText = 'India Meteorological Department\nHydromet Division, New Delhi';
        const headingText1 = 'STATE-WISE RAINFALL DISTRIBUTION';
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
    
        // Build header rows
        const dateLabel = this.data.startDate === this.data.endDate
            ? `DAY: ${this.convertToIndianDateFormat(this.data.startDate)}`
            : `DAY: ${this.convertToIndianDateFormat(this.data.startDate)} to ${this.convertToIndianDateFormat(this.data.endDate)}`;
        const periodLabel = `PERIOD: ${this.convertToIndianDateFormat(this.seasonPeriodDate.startDate)} to ${this.convertToIndianDateFormat(this.seasonPeriodDate.endDate)}`;
        ws_data.push(['', '', dateLabel, '', '', '', periodLabel, '', '', '']);
        ws_data.push(['S.No', 'REGION/STATE', 'ACTUAL(mm)', 'NORMAL(mm)', '%DEP.', 'CAT.',
                      'ACTUAL(mm)', 'NORMAL(mm)', '%DEP.', 'CAT.']);
    
        // Populate rows as in PDF
        this.loadTheRows();
        for (const row of this.rows) {
            ws_data.push(row.map(cell => (typeof cell === 'object' ? cell.content : cell)));
        }
    
        // Add legend rows (describe color by text, since Excel cell fills are limited with open SheetJS)
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
    
        const ws = XLSX.utils.aoa_to_sheet(ws_data);
        XLSX.utils.book_append_sheet(wb, ws, 'StateRainfall');
        return wb;
    };

    async setData(stateData, regionData, stateSeasonData, regionSeasonData, dateRange, seasonPeriodDate) {
        this.statedepCurrdate = stateData;
        this.regiondepCurrdate = regionData;
        this.statedepSeasondate = stateSeasonData;
        this.regiondepSeasondate = regionSeasonData;
        this.data = dateRange;
        this.seasonPeriodDate = seasonPeriodDate;
    }
}

module.exports = PDFStateService;
