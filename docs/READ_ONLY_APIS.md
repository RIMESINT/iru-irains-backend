# iRAINS Backend — Read-Only (Fetch) API Catalog

Every API in this backend that **only reads** data — nothing is inserted, updated or deleted.
Includes both `GET` endpoints and the many `POST` endpoints that are reads in disguise
(this codebase sends filters in the request body, so most fetches are `POST`).

- **Base URL:** `http(s)://<host>:<PORT>/api/v1` (`PORT` defaults to `3000`, see [index.js:147](../index.js#L147))
- **Map routes only:** `http(s)://<host>:<PORT>/api/v1/maps`
- **Entry point:** [index.js](../index.js). `app.js` in the repo root is legacy and is *not* what runs.
- **Auth:** none on these routes, except the `*APIexport` / NWP family which check a hard-coded `user`/`pass` in the body.
- **Date format:** `YYYY-MM-DD` everywhere.
- **Default dates:** most rainfall endpoints fall back to *today* when `startDate`/`endDate` are omitted; if you send only one, the other is set to the same value.
- **Standard envelope:** `{ success: true, message: "...", data: [...] }`. Errors are `{ success: false, message, error }` with 400 (bad input), 401 (bad export credentials), 404 (not found) or 500.
- **AWS day convention:** an AWS rainfall day is named for the date it **ends** on (08:30 IST → 08:30 IST), and raw AWS timestamps are UTC. That is why the AWS queries scan `startDate - 1 day`.

> **Sample responses below show the *shape* of the answer with illustrative values, not real readings.**

---

## Quick index

| # | Section | What it answers |
|---|---------|-----------------|
| 1 | [Rainfall by admin level](#1-rainfall-by-administrative-level) | "How much rain did each district/state/region get?" |
| 2 | [IMD + AWS combined](#2-rainfall-including-aws-imd--aws-mode) | Same, but AWS stations folded in |
| 3 | [Coverage & counts](#3-coverage--reporting-counts) | "How many stations actually reported?" |
| 4 | [Master lists](#4-master-lists--geography-metadata) | Dropdown / lookup data |
| 5 | [Normals](#5-normals-management-reads) | "What is the normal rainfall for X?" |
| 6 | [Station data](#6-station-level-daily-data) | Raw per-station readings |
| 7 | [Revision log](#7-revision-log--data-entry-investigation) | "Who changed what, and when?" |
| 8 | [Top-N & range statistics](#8-top-n-and-range-statistics) | "Wettest N places in a period" |
| 9 | [Monsoon activity](#9-monsoon-activity) | Vigorous / active / weak classification |
| 10 | [Spatial distribution](#10-spatial-distribution) | Widespread / scattered / dry categories |
| 11 | [State AWS feeds](#11-state-aws--arg-feeds-11-sources) | UP, NHP, Zomato, Karnataka … AWS data |
| 12 | [AWS realtime analytics](#12-aws-realtime-analytics--health) | Feed health, unmapped stations, timelines |
| 13 | [Calculations mode](#13-calculations-mode-imd-vs-imd--aws) | Which mode the system is running in |
| 14 | [Station dashboard](#14-station-dashboard) | Network metrics, search, history |
| 15 | [Admin panel](#15-admin-panel--operations) | Visitors, exclusions, activity logs, DB info |
| 16 | [GeoJSON](#16-geojson) | Map boundary files |
| 17 | [PDF & documents](#17-pdf--document-reads) | Stored documents |
| 18 | [Map images](#18-map-images) | Product map image URLs |
| 19 | [Email reads](#19-email-reads) | Mail logs and groups |
| 20 | [Chat](#20-rainfall-chat-llm) | Natural-language questions over rainfall data |
| 21 | [Credential-gated exports](#21-credential-gated-export-apis-external-consumers) | CWC / NWP external feeds |
| 22 | [FTP-source reads](#22-ftp-source-reads-legacy-parallel-set) | Legacy FTP-fed parallel set |
| 23 | [⚠️ Not read-only](#23--endpoints-that-look-like-reads-but-are-not) | GETs that write — don't call casually |

---

## 1. Rainfall by administrative level

The core product. One row per entity with normal, actual and departure %.
All take `{ startDate, endDate }` in the body; omit both for today.
Source: [controllers/District.js](../controllers/District.js), [State.js](../controllers/State.js), [block.js](../controllers/block.js), [SubDivision.js](../controllers/SubDivision.js), [Region.js](../controllers/Region.js), [Country.js](../controllers/Country.js)

| Method | Endpoint | Level | What it gives you |
|---|---|---|---|
| POST | `/fetchBlockData` | Block | Normal, actual and departure % for every block |
| POST | `/fetchDistrictData` | District | Normal, actual and departure % for every district — the most-used API in the system |
| POST | `/fetchSubDivisionData` | Subdivision | Same for the 36 met subdivisions |
| POST | `/fetchStateData` | State | Same, state-wise |
| POST | `/fetchRegionData` | Region | Same for the 4 met regions |
| POST | `/fetchCountryData` | Country | One national row |
| POST | `/fetchCummulativeRegionData` | Region | Running season/period total per region instead of the range figure |
| POST | `/fetchCummulativeCountryData` | Country | Running season/period total nationally |
| POST | `/fetchBlockRainfallAnalysis` | Block | Block rainfall with excess/deficient category buckets attached |
| POST | `/getLatestFiveYearDataOfDistrict` | District | Same window across the last 5 years for one district — body `{ startDate, endDate, district_code }` |

**Useful for:** the district/state/subdivision rainfall tables, departure maps, and any "how did we do this week" question.

**Example question — "How much rain did every district get between 1 and 7 August 2026, and how far off normal is that?"**

```bash
curl -X POST http://localhost:3000/api/v1/fetchDistrictData \
  -H "Content-Type: application/json" \
  -d '{"startDate":"2026-08-01","endDate":"2026-08-07"}'
```

**Answer:**

```json
{
  "success": true,
  "message": "District data fetched Successfully",
  "data": [
    {
      "district_code": "MH-PUN",
      "district_name": "PUNE",
      "state_code": "MH",
      "sub_division_code": "MADHYA MAHARASHTRA",
      "region_code": "SPI",
      "normal_rainfall": 62.4,
      "actual_rainfall": 118.7,
      "departure": 90.2
    }
  ]
}
```

Read it as: Pune should have had ~62 mm over those 7 days, actually got ~119 mm, so it is **+90 % departure** (large excess). `departure` is the number the colour-coded maps are built from.

**Other things you can ask this family:**

- *"What did the whole country get today?"* → `POST /fetchCountryData` with an empty body `{}` → one row, national normal vs actual.
- *"Give me the season total per region, not the daily figure."* → `POST /fetchCummulativeRegionData` with the season range.
- *"How has Pune done over the last five years for this window?"* → `POST /getLatestFiveYearDataOfDistrict` with `district_code`.

---

## 2. Rainfall including AWS (IMD + AWS mode)

Same six levels, but station values are blended with AWS observations.
Source: [controllers/AwsInclusiveControllers.js](../controllers/AwsInclusiveControllers.js)

| Method | Endpoint | What it gives you |
|---|---|---|
| POST | `/fetchBlockDataWithAWS` | Block rainfall with AWS observations blended into the station pool |
| POST | `/fetchDistrictDataWithAWS` | District rainfall including AWS — usually higher coverage than IMD-only |
| POST | `/fetchSubDivisionDataWithAWS` | Subdivision rainfall including AWS |
| POST | `/fetchStateDataWithAWS` | State rainfall including AWS |
| POST | `/fetchRegionDataWithAWS` | Region rainfall including AWS |
| POST | `/fetchCountryDataWithAWS` | National rainfall including AWS |

Body: `{ startDate, endDate }`. Response shape is identical to §1.

**Useful for:** comparing "IMD only" vs "IMD + AWS" numbers — this is the pair the Calculations Mode toggle (§13) switches the frontend between.

**Example question — "Does adding AWS stations change Vidarbha's district picture for yesterday?"**
Call `/fetchDistrictData` and `/fetchDistrictDataWithAWS` with the same dates and diff the `actual_rainfall` per `district_code`. Districts with many AWS stations and few IMD stations move the most.

---

## 3. Coverage & reporting counts

"How many stations/districts actually reported?" — the data-quality denominator behind every number in §1.

| Method | Endpoint | Body | Counts |
|---|---|---|---|
| POST | `/fetchBlockStationCount` | `{startDate,endDate}` | Stations reporting per block |
| POST | `/fetchDistrictStationCount` | `{startDate,endDate}` | Stations reporting per district |
| POST | `/fetchSubDivisionDistrictCount` | `{startDate,endDate}` | Districts reporting per subdivision |
| POST | `/fetchStateDistrictCount` | `{startDate,endDate}` | Districts reporting per state |
| POST | `/fetchRegionCoverageCount` | `{startDate,endDate}` | Coverage per region |
| POST | `/fetchCountryCoverageCount` | `{startDate,endDate}` | Coverage nationally |
| POST | `/fetchCentreStationSummary` | `{startDate,endDate}` | Per MC/RMC: how many of its stations reported |

**Useful for:** spotting a district whose "0 mm" really means "nobody reported", and for the MC-wise data-entry chase-up.

**Example question — "Which MCs still have stations missing for 10 August?"**

```bash
curl -X POST http://localhost:3000/api/v1/fetchCentreStationSummary \
  -H "Content-Type: application/json" \
  -d '{"startDate":"2026-08-10","endDate":"2026-08-10"}'
```

**Answer:**

```json
{
  "success": true,
  "data": [
    { "centre_type": "MC", "centre_name": "PUNE", "total_stations": 214, "reported": 198, "pending": 16 }
  ]
}
```

Read it as: Pune MC has 16 stations with no entry for that day — that is your call list.

---

## 4. Master lists & geography metadata

Dropdown data and static geography. All `GET`, no parameters unless shown.

| Method | Endpoint | Returns |
|---|---|---|
| GET | `/getAllBlocks` | All blocks with codes and parent district |
| GET | `/getAllDistrict` | All districts with state/subdivision/region codes |
| GET | `/getAllSubDivisions` | All 36 subdivisions |
| GET | `/getAllStates` | All states with region mapping |
| GET | `/getAllRegions` | The 4 met regions |
| GET | `/getAllStations` | Full station master (code, name, lat/lon, type, centre) |
| GET | `/fetchMetWiseStates` | States grouped the meteorological way (not the administrative way) |
| GET | `/metWiseSubDivisions` | Subdivisions grouped met-wise |
| GET | `/getDistrictAreaPercentages` | Each district's share of its parent's area — the weights used in area-weighted averages |
| GET | `/getStateAreaPercentages` | Same, state level |
| GET | `/getSubdivisionAreaPercentages` | Same, subdivision level |
| GET | `/getRegionAreaPercentages` | Same, region level |
| GET | `/getNormalDistrictDetails` | The `normal_district_details` master rows |
| GET | `/getDistrictDisplayOrder` | Report row order for districts |
| GET | `/getStateDisplayOrder` | Report row order for states |
| GET | `/getSubdivisionDisplayOrder` | Report row order for subdivisions |
| POST | `/getCenterDetails` | Body `{ centre_type: "MC" \| "RMC" \| "HQ" }` → that centre's stations/details |

**Useful for:** populating filters, resolving a code to a name, and reproducing the exact row order used in the printed bulletins.

**Example question — "What are all the districts in Madhya Pradesh and their codes?"**

```bash
curl http://localhost:3000/api/v1/getAllDistrict
```

**Answer:** an array you filter on `state_code`:

```json
{
  "success": true,
  "data": [
    { "district_code": "MP-BPL", "district_name": "BHOPAL", "state_code": "MP",
      "subdiv_code": "WEST MADHYA PRADESH", "region_code": "CI" }
  ]
}
```

**Example question — "Why doesn't the state average equal the plain mean of its districts?"**
→ `GET /getStateAreaPercentages`. Each district carries an area weight; a large district pulls the state figure toward itself.

---

## 5. Normals management (reads)

Reference long-period averages, per level. Every level has the same four read endpoints.

| Method | Endpoint | Notes |
|---|---|---|
| GET | `/getBlockNormalList` | List of blocks that have normals |
| GET | `/getBlockNormals/:block_id?year=2026` | That block's 365 daily normals |
| GET | `/downloadBlockNormalTemplate/:block_id` | Pre-filled Excel template (file download) |
| GET | `/getMissingBlockNormals?year=2026` | Blocks with no normals for that year |
| GET | `/getDistrictNormals/:district_code` | District daily normals |
| GET | `/downloadDistrictNormalTemplate` | Blank district template |
| GET | `/downloadDistrictNormalTemplate/:district_code` | Pre-filled for one district |
| GET | `/getMissingDistrictNormals?year=` | Districts missing normals |
| GET | `/getStateNormalList`, `/getStateNormals/:state_code?year=`, `/downloadStateNormalTemplate/:state_code`, `/getMissingStateNormals?year=` | State level |
| GET | `/getSubdivisionNormalList`, `/getSubdivisionNormals/:sub_division_code?year=`, `/downloadSubdivisionNormalTemplate/:sub_division_code`, `/getMissingSubdivisionNormals?year=` | Subdivision level |
| GET | `/getRegionNormalList`, `/getRegionNormals/:region_id?year=`, `/downloadRegionNormalTemplate/:region_id`, `/getMissingRegionNormals?year=` | Region level |
| GET | `/getCountryNormalList`, `/getCountryNormals/:country_name?year=`, `/downloadCountryNormalTemplate/:country_name`, `/getMissingCountryNormals?year=` | Country level |

`year` defaults to the current year when omitted.

**Useful for:** the Normals admin screen, and for auditing why a departure looks wrong (usually a missing or zero normal).

**Example question — "Which districts have no 2026 normals loaded, so their departure will be garbage?"**

```bash
curl "http://localhost:3000/api/v1/getMissingDistrictNormals?year=2026"
```

**Answer:**

```json
{ "success": true, "year": 2026, "count": 3,
  "data": [ { "district_code": "LA-LEH", "district_name": "LEH" } ] }
```

Read it as: three districts will show a nonsense departure until normals are uploaded.

---

## 6. Station-level daily data

Raw per-station readings — the layer everything else aggregates from.
Source: [controllers/Station.js](../controllers/Station.js), [controllers/StationDataUpdates.js](../controllers/StationDataUpdates.js)

| Method | Endpoint | Body / Query | Purpose |
|---|---|---|---|
| POST | `/fetchStationData` | `{ Date }` | All station readings for one date |
| POST | `/fetchStationDataNew` | `{ Date }` | Older implementation of the same (routes are cross-wired — see note) |
| POST | `/fetchStationDataIncludingVerification` | `{ Date }` | Same plus verification flags (who verified, when) |
| POST | `/fetchInRangeStationdata` | `{ fromDate, toDate }` | Station readings across a range |
| POST | `/fetchInRangeStationdataNew` | `{ fromDate, toDate }` | Alternate range implementation |
| POST | `/fetchStationDataEntryRange` | `{ fromDate, toDate }` | Data-entry view of the range (entry status per station/day) |
| POST | `/fetchAllDatesAndDataOfStation` | `{ station_id }` | Full history for one station |
| POST | `/fetchStationDataInRadius` | `{ Date, lat, long, range }` | Every station within `range` km of a point |
| POST | `/fetchStationWithMaxRainfall` | `{ startDate, endDate, limit }` | Heaviest stations in a window |
| POST | `/fetchFilteredStationUnifiedFile` | `{ startDate, endDate, districtCodes }` | Unified export-style station file |
| POST | `/dataActions` | `{ startDate }` | Per-day data-entry action summary |
| GET | `/fetchStationLogs` | — | Station data change log |
| GET | `/getAllStations` | — | Station master (same as §4) |

> **Note (route cross-wiring, [routes/stationRoutes.js:106-113](../routes/stationRoutes.js#L106-L113)):** `/fetchStationData` is bound to the handler named `fetchStationDataNew` and vice-versa; likewise `/fetchInRangeStationdata` ↔ `/fetchInRangeStationdataNew`. Go by the **URL**, not the handler name.

**Useful for:** the data-entry grid, station popups on the map, and "which station recorded that extreme value".

**Example question — "Which stations recorded the heaviest rain in the first week of August?"**

```bash
curl -X POST http://localhost:3000/api/v1/fetchStationWithMaxRainfall \
  -H "Content-Type: application/json" \
  -d '{"startDate":"2026-08-01","endDate":"2026-08-07","limit":10}'
```

**Answer:**

```json
{
  "success": true,
  "data": [
    { "station_code": "42667", "station_name": "MAHABALESHWAR",
      "district_name": "SATARA", "state_name": "MAHARASHTRA",
      "rainfall": 486.2, "collection_date": "2026-08-04" }
  ]
}
```

**Example question — "There's a suspicious 400 mm at station X — what did its neighbours record that day?"**

```bash
curl -X POST http://localhost:3000/api/v1/fetchStationDataInRadius \
  -H "Content-Type: application/json" \
  -d '{"Date":"2026-08-04","lat":17.92,"long":73.65,"range":50}'
```

→ every station within 50 km with its reading, so you can see instantly whether 400 mm is real or a typo.

---

## 7. Revision log / Data Entry Investigation

"Who changed which station's value, when, and from what." Built on `created_at` / `updated_at` — there is no separate history table.
Source: [controllers/StationDataUpdates.js](../controllers/StationDataUpdates.js)

All accept a date window: `{ date }` or `{ fromDate, toDate }`.

| Method | Endpoint | Answers |
|---|---|---|
| POST | `/fetchRevisionLog` | All revisions in the window, grouped |
| POST | `/fetchRevisionStationDetails` | Body `{ revisionDate, dataDate }` — the stations behind one revision bucket |
| POST | `/fetchRevisionLogByCentre` | Same, rolled up per MC/RMC |
| POST | `/fetchCentreRevisionDetails` | Body `{ centreType, centreName, ... }` — one centre's revisions (default 3-day window) |
| POST | `/fetchRevisionEventsForDate` | Body `{ date }` — timeline of revision events on that date |
| POST | `/fetchRevisionLogExport` | Same data flattened for Excel export |
| POST | `/fetchRevisionStationMap` | Revisions with lat/lon, for plotting on a map |

**Useful for:** the Data Entry Investigation page — proving whether a published figure changed after the bulletin went out.

**Example question — "Were any values for 5 August edited after the fact, and by which centres?"**

```bash
curl -X POST http://localhost:3000/api/v1/fetchRevisionLogByCentre \
  -H "Content-Type: application/json" \
  -d '{"date":"2026-08-05"}'
```

**Answer:**

```json
{
  "success": true,
  "data": [
    { "centre_type": "MC", "centre_name": "NAGPUR",
      "data_date": "2026-08-05", "revision_date": "2026-08-07",
      "stations_revised": 12, "days_late": 2 }
  ]
}
```

Read it as: Nagpur MC changed 12 stations' 5 Aug values on 7 Aug — two days after the fact. Drill in with `/fetchCentreRevisionDetails`.

---

## 8. Top-N and range statistics

| Method | Endpoint | Body | What it gives you |
|---|---|---|---|
| POST | `/fetchTopNBlocks` | `{ block_code?, startDate, endDate, topN }` | The N wettest blocks in the window, ranked |
| POST | `/fetchTopNDistricts` | `{ district_code?, startDate, endDate, topN }` | The N wettest districts, ranked |
| POST | `/fetchTopNSubdivisions` | `{ subdivision_code?, startDate, endDate, topN }` | The N wettest subdivisions |
| POST | `/fetchTopNStates` | `{ state_code?, startDate, endDate, topN }` | The N wettest states |
| POST | `/fetchTopNRegions` | `{ region_code?, startDate, endDate, topN }` | The N wettest regions |
| POST | `/fetchTopNCountries` | `{ country_code?, startDate, endDate, topN }` | Country-level ranking |
| POST | `/fetchBlockRangeStatistics` | `{ startDate, endDate }` | Min / max / avg / total daily rainfall per block over the period |
| POST | `/fetchDistrictRangeStatistics` | `{ startDate, endDate }` | Same stats per district |
| POST | `/fetchSubdivisionRangeStatistics` | `{ startDate, endDate }` | Same stats per subdivision |
| POST | `/fetchStateRangeStatistics` | `{ startDate, endDate }` | Same stats per state — one summary line per state |
| POST | `/fetchRegionRangeStatistics` | `{ startDate, endDate }` | Same stats per region |
| POST | `/fetchCountryRangeStatistics` | `{ startDate, endDate }` | Same stats nationally |
| GET | `/top-rainfall-stations` | `?days=30&topN=100` | Wettest individual stations over the last N days (defaults 30 / 100) |

**Useful for:** "wettest places" panels, leaderboards, and monthly summary slides.

**Example question — "Top 5 wettest districts in July 2026."**

```bash
curl -X POST http://localhost:3000/api/v1/fetchTopNDistricts \
  -H "Content-Type: application/json" \
  -d '{"startDate":"2026-07-01","endDate":"2026-07-31","topN":5}'
```

**Answer:** five rows, wettest first, with `actual_rainfall`, `normal_rainfall` and `departure` per district.

**Example question — "Give me one line summarising each state for the monsoon so far."**
→ `POST /fetchStateRangeStatistics` with `{"startDate":"2026-06-01","endDate":"2026-08-11"}` → per state: total, average, min and max daily rainfall over the period.

---

## 9. Monsoon activity

Classifies each subdivision/district as vigorous / active / weak / subdued from rainfall against normal.
Source: [controllers/scripts/station/monsoon_activity.js](../controllers/scripts/station/monsoon_activity.js)

| Method | Endpoint | Body | Window |
|---|---|---|---|
| POST | `/monsoon-activity` | `{ date }` | Subdivision, single day |
| POST | `/monsoon-activity-district` | `{ date }` | District, single day |
| POST | `/monsoon-activity-subdiv-last7` | `{ date }` | Subdivision, 7 days ending `date` |
| POST | `/monsoon-activity-subdiv-last30` | `{ date }` | Subdivision, 30 days |
| POST | `/monsoon-activity-district-last7` | `{ date }` | District, 7 days |
| POST | `/monsoon-activity-district-last30` | `{ date }` | District, 30 days |

**Useful for:** the monsoon activity bulletin text and the activity-shaded maps.

**Example question — "Where was the monsoon vigorous on 5 August?"**

```bash
curl -X POST http://localhost:3000/api/v1/monsoon-activity \
  -H "Content-Type: application/json" \
  -d '{"date":"2026-08-05"}'
```

**Answer:**

```json
{
  "success": true,
  "message": "Monsoon activity computed successfully",
  "date": "2026-08-05",
  "data": [
    { "sub_division": "KONKAN & GOA", "actual": 88.4, "normal": 24.1,
      "departure": 267.0, "activity": "VIGOROUS" }
  ]
}
```

The 7/30-day variants return `from` and `to` instead of `date`.

---

## 10. Spatial distribution

Classifies rainfall spread as widespread / fairly widespread / scattered / isolated / dry.

| Method | Endpoint | Query |
|---|---|---|
| GET | `/getSpatialDistributionData` | `?date=` or `?startDate=&endDate=`, plus `?mode=daywise\|period` — subdivision level |
| GET | `/getSpatialDistributionDataState` | Same parameters — state level |

**Useful for:** the "rainfall was widespread over Konkan" bulletin sentences and the distribution map.

**Example question — "Was the rain over Konkan on 5 August widespread or just a couple of stations?"**

```bash
curl "http://localhost:3000/api/v1/getSpatialDistributionData?date=2026-08-05&mode=daywise"
```

**Answer:**

```json
{
  "success": true, "mode": "daywise",
  "startDate": "2026-08-05", "endDate": "2026-08-05",
  "data": [
    { "sub_division": "KONKAN & GOA", "date": "2026-08-05",
      "total_stations": 96, "stations_with_rain": 81,
      "percentage": 84.4, "distribution": "WIDESPREAD" }
  ]
}
```

Read it as: 81 of 96 stations reported rain (84 %) → **widespread**. Use `mode=period` to classify the whole range as one figure instead of day by day.

---

## 11. State AWS / ARG feeds (11 sources)

Eleven independently-ingested AWS/ARG networks, each exposing the same endpoint set.
Source: [controllers/scripts/aws/](../controllers/scripts/aws/)

**Sources and their path prefixes:**
`/up-aws`, `/nhp-aws`, `/zomato-aws`, `/meghalaya-aws`, `/mizoram-aws`, `/tamilnadu-aws`, `/uttarakhand-aws`, `/telangana-aws`, `/karnataka-aws`, `/iitm-mumbai`

**Per-source endpoints (all POST):**

| Endpoint | Body | Returns |
|---|---|---|
| `/<source>/daily` | `{ startDate, endDate, district? }` | Per station per AWS-day: total rainfall, avg/max/min temp, avg RH, avg wind, reading count, completeness % |
| `/<source>/hourly` | `{ date, hour?, district? }` | Per station per IST hour within the AWS day |
| `/<source>/slot` | `{ date, time, district? }` | One 15-minute slot across all stations |
| `/<source>/cumulative` | `{ startDate, endDate, district? }` | Running total per station over the range |
| `/<source>/district-summary` | `{ date? }` | District rollup for that AWS day (defaults to current AWS day) |
| `/<source>/station-slots` | `{ date? }` | All slots for each station — the 96-slot completeness view |
| `/<source>/actual-departure` | `{ startDate, endDate }` | Actual vs normal per entity |
| `/<source>/departure-analysis` | `{ startDate, endDate }` | Departure with category buckets |
| `/<source>/departure-export` | `{ user, pass, fromDate, toDate }` | Credential-gated export (see §21) |

**Variants:** Zomato is city-based, so it has `/zomato-aws/city-summary` and takes `city` instead of `district`. Tamil Nadu additionally has `/tamilnadu-aws/block-summary` and accepts a `block` filter.

**Also:**

| Method | Endpoint | Body |
|---|---|---|
| POST | `/state-aws/fetchFilteredStationUnifiedFile` | `{ startDate, endDate }` — unified file across state AWS sources |
| POST | `/aws-station/fetchFilteredStationUnifiedFile` | `{ startDate, endDate, districtCodes }` — unified file from the stored AWS daily table |

**Useful for:** the state AWS dashboards, hourly rainfall charts, and checking whether a feed is delivering all 96 slots a day.

**Example question — "What did UP's AWS stations record on 10 August, and did any of them miss readings?"**

```bash
curl -X POST http://localhost:3000/api/v1/up-aws/daily \
  -H "Content-Type: application/json" \
  -d '{"startDate":"2026-08-10","endDate":"2026-08-10","district":"LUCKNOW"}'
```

**Answer:**

```json
{
  "success": true,
  "message": "Daily UP AWS data fetched successfully",
  "data": [
    { "dat": "2026-08-10", "district": "LUCKNOW", "id": "UP0142", "station": "MALIHABAD",
      "type": "AWS", "lat": 26.92, "lon": 80.71,
      "total_rainfall": 41.5, "avg_temp": 28.4, "max_temp": 33.1, "min_temp": 24.6,
      "avg_rh": 82.3, "avg_wind_speed": 7.2,
      "readings_count": 88, "data_completeness_pct": 91.7 }
  ]
}
```

Read it as: Malihabad recorded 41.5 mm, but only 88 of the expected 96 quarter-hourly readings arrived → **91.7 % complete**, 8 slots dropped. `data_completeness_pct` is the quickest feed-health signal in the whole API.

**Example question — "Show me the rainfall hour by hour for that AWS day."**
→ `POST /up-aws/hourly` with `{"date":"2026-08-10"}` (add `"hour":15` for a single hour).

---

## 12. AWS realtime analytics & health

Cross-source analytics over all AWS feeds at once.
Source: [controllers/scripts/aws/awsRealtimeAnalytics.js](../controllers/scripts/aws/awsRealtimeAnalytics.js)

| Method | Endpoint | Body | Purpose |
|---|---|---|---|
| POST | `/aws-realtime/filters` | `{ date? }` | Filter options: current AWS day, states, districts by state, source list |
| POST | `/aws-realtime/sources` | `{ date?, lookbackDays? }` | Per-source health: how many stations reported, gaps |
| POST | `/aws-realtime/unmapped-stations` | `{ date?, lookbackDays?, limit?, sources? }` | AWS stations with no mapping to an IMD entity |
| POST | `/aws-realtime/timeline` | `{ date?, sources?, state?, district?, requireCoords? }` | 24-hour ingestion timeline for the AWS day |
| POST | `/aws-realtime/cumulative` | `{ startDate, endDate, stateCodes?, districtCodes?, stationType? }` | Cumulative totals with a station summary |
| POST | `/aws-realtime/station-series` | `{ stationCode, startDate, endDate }` | One station's full time series |
| POST | `/fetchAwsSourceLogs` | `{ fromDate, toDate }` | Ingestion logs per source per date |

**Useful for:** answering "is the AWS pipeline healthy today?" and finding stations that are streaming data nobody is counting.

**Example question — "Which AWS sources are behind today?"**

```bash
curl -X POST http://localhost:3000/api/v1/aws-realtime/sources \
  -H "Content-Type: application/json" -d '{"lookbackDays":7}'
```

**Answer:**

```json
{
  "success": true, "message": "AWS source health fetched",
  "data": {
    "date": "2026-08-11",
    "window": { "from": "2026-08-05", "to": "2026-08-11", "days": 7 },
    "generated_at_ist": "2026-08-11 12:40:05",
    "sources": [
      { "source": "up_aws", "stations_expected": 1842, "stations_reporting": 1790,
        "last_seen_ist": "2026-08-11 11:45:00", "status": "OK" }
    ]
  }
}
```

**Example question — "How many AWS stations are sending data we throw away because they're not mapped?"**

```bash
curl -X POST http://localhost:3000/api/v1/aws-realtime/unmapped-stations \
  -H "Content-Type: application/json" -d '{"lookbackDays":7,"limit":500}'
```

→ `data.count_by_source` gives the per-source tally and `data.truncated` tells you whether you hit the `limit`.

**Example question — "Did the feed stop overnight?"**
→ `POST /aws-realtime/timeline` with `{}`. The response carries `day_start_ist` and a slot-by-slot count; a run of zeros between two timestamps is a gap. (There is a known nightly gap in the fetcher — see the AWS pipeline notes.)

---

## 13. Calculations mode (IMD vs IMD + AWS)

| Method | Endpoint | Body / Query | Purpose |
|---|---|---|---|
| GET | `/calculations-mode` | — | Which mode the system is in right now |
| POST | `/fetchCalcModeStations` | `{ date }` or `{ fromDate, toDate }` | Stations counted under the active mode |
| POST | `/fetchCalcModeCountryRange` | `{ fromDate, toDate }` | Country totals under the active mode |
| POST | `/fetchCalcModeStationsPivot` | `{ startDate, endDate }` | IMD vs AWS pivot: per-station and per-date, side by side |

**Useful for:** proving which stations went into a published figure, and reconciling an IMD-only number against an IMD+AWS number.

**Example question — "Are we currently publishing IMD-only or IMD+AWS?"**

```bash
curl http://localhost:3000/api/v1/calculations-mode
```

**Answer:** `{ "success": true, "use_aws": 1, "label": "IMD + AWS", "updated_at": "2026-08-09T06:15:22.104Z", ... }` — `use_aws: 0` means IMD only.

**Example question — "Show me, date by date, which stations the IMD set and the AWS set contributed."**

```bash
curl -X POST http://localhost:3000/api/v1/fetchCalcModeStationsPivot \
  -H "Content-Type: application/json" \
  -d '{"startDate":"2026-08-01","endDate":"2026-08-07"}'
```

**Answer:** `{ success, dates: [...], imd: { stations: [...], perDate: {...} }, aws: { stations: [...], perDate: {...} } }` — two parallel blocks you can diff directly.

---

## 14. Station dashboard

Network health and station administration reads.
Source: [controllers/StationDashboardController.js](../controllers/StationDashboardController.js)

| Method | Endpoint | Query | Returns |
|---|---|---|---|
| GET | `/station-dashboard/metrics` | — | `{ total, active, inactive, operational_rate }` |
| GET | `/station-dashboard/distribution` | `?level=state\|district\|region` | `{ labels: [], counts: [] }` — ready for a bar chart |
| GET | `/station-dashboard/recent-changes` | `?days=7` | Stations added/edited/deactivated recently |
| GET | `/station-dashboard/history` | `?page=1&limit=25` | Paged change history — `{ data, total, page, pages }` |
| GET | `/station-dashboard/timeline` | `?name=` | One station's lifecycle timeline |
| GET | `/station-dashboard/geography` | — | Geographic rollup of the network |
| GET | `/station-dashboard/blocks` | `?district_code=` | Blocks in a district |
| GET | `/station-dashboard/rmc-mc-options` | — | RMC/MC dropdown values |
| GET | `/station-dashboard/station` | `?station_code=` | One station's full record |
| GET | `/station-dashboard/stations` | `?q=&page=1&limit=50` | Active stations, searchable and paged |
| POST | `/station-dashboard/search` | **query string**, not body | Advanced search — `?q=&mode=contains\|starts\|exact&case_sensitive=&status=active\|inactive\|all&station_type=&region=&state=&page=&limit=` |

> **Gotcha:** `/station-dashboard/search` is registered as `POST` but the handler reads `req.query` ([StationDashboardController.js:300-306](../controllers/StationDashboardController.js#L300-L306)). Send the filters in the **URL query string**; a JSON body is ignored.

**Useful for:** the Station Dashboard page — network size, where the stations are, and what changed lately.

**Example question — "How big is the network and how much of it is live?"**

```bash
curl http://localhost:3000/api/v1/station-dashboard/metrics
```

**Answer:** `{ "success": true, "data": { "total": 6421, "active": 5987, "inactive": 434, "operational_rate": "93.2" } }`

**Example question — "Find every active station in Maharashtra with 'nagar' in the name."**

```bash
curl -X POST "http://localhost:3000/api/v1/station-dashboard/search?q=nagar&state=MH&status=active&limit=50"
```

**Answer:** `{ success, data: [...], total, page, pages }`.

---

## 15. Admin panel & operations

| Method | Endpoint | Query / Body | Purpose |
|---|---|---|---|
| GET | `/visitor/count` | — | Today's unique visitors |
| GET | `/visitor/total-count` | — | All-time visitors |
| GET | `/visitor/history` | — | Visitors per day |
| POST | `/calculation-exclusion/get-exclusions` | `{ entity_type, from_date, to_date }` | Entities excluded from calculations in that window |
| POST | `/calculation-exclusion/check-status` | `{ entity_type, entity_code, from_date, to_date }` | Is this one entity excluded? |
| GET | `/getStationsForExclusion` | — | IMD station list for the exclusion UI |
| GET | `/getAwsStationsForExclusion` | — | AWS station list for the exclusion UI |
| GET | `/admin/activity-logs` | `?limit=50&offset=0&module_name=&category_name=&page_name=&route_path=&action_type=&entity_type=&login_id=` | Who did what in the admin panel |
| GET | `/admin/realtime-config` | — | Socket.IO path, client/server event names, page registry |
| GET | `/getDbInfo` | — | Table sizes, row counts, DB size, PG version, disk usage |
| GET | `/cron-schedules` | — | All cron jobs with their schedules and active flags |
| GET | `/data-entry-lock` | — | `{ is_locked }` — is data entry currently frozen? |
| POST | `/data-entry-lock-history` | `{ date }` | Lock/unlock transitions on that date |
| GET | `/map-data-schedule/:role` | `:role` = `hq` / `mc` / `sp` | Publish/restrict schedule for that role |
| GET | `/all-statistics/default-selection` | `?username=` | Which ALL-STATISTICS products open pre-ticked for a user |

**Useful for:** operational questions — is the system locked, what's scheduled, how big is the database, who touched what.

**Example question — "Which tables are eating the disk?"**

```bash
curl http://localhost:3000/api/v1/getDbInfo
```

**Answer:**

```json
{
  "success": true,
  "tables": [
    { "table_name": "up_aws_observations", "approx_rows": 184920311,
      "data_size": "42 GB", "index_size": "11 GB", "total_size": "53 GB" }
  ],
  "database": { "db_name": "irains", "db_size": "96 GB", "pg_version": "PostgreSQL 14.x" },
  "disk": { "total": "1.8 TB", "used": "1.1 TB", "free": "640.2 GB", "pct_used": "64%" }
}
```

**Example question — "Is data entry locked right now?"** → `GET /data-entry-lock` → `{ "success": true, "is_locked": 1 }` (1 = locked).

**Example question — "Which districts were excluded from the August calculations?"**

```bash
curl -X POST http://localhost:3000/api/v1/calculation-exclusion/get-exclusions \
  -H "Content-Type: application/json" \
  -d '{"entity_type":"district","from_date":"2026-08-01","to_date":"2026-08-31"}'
```

**Answer:** `{ success, message, count, exclusions: [ { entity_type, entity_code, entity_name, from_date, to_date, remark } ] }`

---

## 16. GeoJSON

| Method | Endpoint | Returns |
|---|---|---|
| GET | `/geojson/upload-history` | Recent GeoJSON uploads (metadata only) |
| GET | `/geojson/:folder` | Files in a folder — metadata only, no geometry |
| GET | `/geojson/:folder/:fileName` | The raw GeoJSON object itself |

**Useful for:** loading boundary layers into the map without bundling them into the frontend.

**Example question — "What district boundary files do we have, and give me one."**

```bash
curl http://localhost:3000/api/v1/geojson/district
curl http://localhost:3000/api/v1/geojson/district/INDIA_DISTRICT.json
```

The list call returns `{ success, folder, files: [...] }`; the file call returns the bare GeoJSON `FeatureCollection` (no envelope) so it can be handed straight to Leaflet/Mapbox.

---

## 17. PDF & document reads

| Method | Endpoint | Params | Returns |
|---|---|---|---|
| GET | `/getPdf/:id` | `:id` | One stored PDF |
| GET | `/getAllPdfsByDocumentType` | — | Documents grouped by type |
| GET | `/getDocumentTypesAndNames` | — | Type/name catalog for dropdowns |
| POST | `/getPdfByDocumentName` | `{ document_name }` | Fetch a document by name |
| GET | `/maps/health`, `/health` | — | Service health checks |

**Report generators** — these only *read* the database but are expensive (Puppeteer renders a PDF), so treat them as jobs rather than lookups:
`POST /generate-district-pdf`, `/download-district-pdf`, `/view-district-pdf`, `/generate-custom-district-pdf`, and the identical `state`, `subdiv` and `region` variants. Body: `{ startDate, endDate }` (or `{ fromDate, toDate }` for the `custom` ones) plus `action: "view" | "download"`.

**Example question — "Give me the district rainfall bulletin for last week as a PDF."**

```bash
curl -X POST http://localhost:3000/api/v1/download-district-pdf \
  -H "Content-Type: application/json" \
  -d '{"startDate":"2026-08-04","endDate":"2026-08-10"}' -o bulletin.pdf
```

---

## 18. Map images

Mounted under `/api/v1/maps`.

| Method | Endpoint | Returns |
|---|---|---|
| GET | `/maps/scrape-urls` | Image URLs scraped from the products site |
| GET | `/maps/images/:filename` | Serves a previously captured image |
| GET | `/maps/health` | Health check |

`POST /maps/capture-maps`, `POST /maps/download-image`, `POST /maps/capture-full-page` and `DELETE /maps/clear-cache` **write files to disk** — they are not reads.

---

## 19. Email reads

| Method | Endpoint | Returns |
|---|---|---|
| GET | `/fetchEmailLogs` | Sent-mail log |
| GET | `/fetchEmailGroups` | Distribution groups and their member addresses |

**Example question — "Did the 8 AM bulletin mail actually go out, and to whom?"** → `GET /fetchEmailLogs` → rows with recipient, subject, status and timestamp.

> `GET /dailyDataUpdateReminderQuery` and `GET /dailyDataVerificationReminder` are GETs but they **send email** — see §23.

---

## 20. Rainfall chat (LLM)

| Method | Endpoint | Body | Returns |
|---|---|---|---|
| GET | `/ollama-chat/health` | — | `{ up: true/false, ... }`; HTTP 503 when the model host is down |
| POST | `/ollama-chat` | `{ question, skipAnswerLlm? }` | Natural-language answer built from a generated SQL read |
| GET | `/rainfall-chat/health` | — | Alias of the above |
| POST | `/rainfall-chat` | `{ question }` | Alias of `/ollama-chat` (kept for the old frontend) |

**Useful for:** free-text questions without knowing which endpoint to call.

**Example question — literally, in the body:**

```bash
curl -X POST http://localhost:3000/api/v1/ollama-chat \
  -H "Content-Type: application/json" \
  -d '{"question":"Which subdivision had the highest rainfall departure last week?"}'
```

**Answer:** HTTP 200 with the answer plus the rows it was derived from; HTTP 422 when the question could not be turned into a valid query; HTTP 503 from `/health` when the model host is unreachable. Set `skipAnswerLlm: true` to get the query result rows without the prose summary.

---

## 21. Credential-gated export APIs (external consumers)

Read-only, but they check `user` and `pass` in the body and return **401** if they don't match. The credentials are **hard-coded in the controllers** (e.g. [District.js:362](../controllers/District.js#L362)) — read them from the source, and consider moving them to environment variables.

| Method | Endpoint | Body | What it gives you |
|---|---|---|---|
| POST | `/fetchBlockDataAPIexport` | `{ user, pass, fromDate, toDate }` | Block rainfall in flat export layout |
| POST | `/fetchDistrictDataAPIexport` | `{ user, pass, fromDate, toDate }` | District rainfall export — the CWC feed |
| POST | `/fetchSubDivisionDataAPIexport` | `{ user, pass, fromDate, toDate }` | Subdivision rainfall export |
| POST | `/fetchStateDataAPIexport` | `{ user, pass, fromDate, toDate }` | State rainfall export |
| POST | `/fetchRegionDataAPIexport` | `{ user, pass, fromDate, toDate }` | Region rainfall export |
| POST | `/fetchCountryDataAPIexport` | `{ user, pass, fromDate, toDate }` | National rainfall export |
| POST | `/fetchTapiBasinRainfallDataAPIexport` | `{ user, pass, fromDate, toDate }` | Rainfall for the Tapi river basin only |
| POST | `/station_data_for_nwp` | `{ user, pass, date }` | Raw IMD station readings for the NWP modelling group |
| POST | `/station_data_for_nwp_aws` | `{ user, pass, ... }` | Same, AWS stations only |
| POST | `/station_data_for_nwp_combined` | `{ user, pass, ... }` | Same, IMD and AWS merged into one feed |
| POST | `/<source>-aws/departure-export` | `{ user, pass, fromDate, toDate }` | Per-source AWS departure export — exists for each of the 11 AWS sources |

**Useful for:** CWC and the NWP modelling group pulling data on a schedule.

**Example question — "What does the CWC feed return for last week?"**

```bash
curl -X POST http://localhost:3000/api/v1/fetchDistrictDataAPIexport \
  -H "Content-Type: application/json" \
  -d '{"user":"<user>","pass":"<pass>","fromDate":"2026-08-04","toDate":"2026-08-10"}'
```

**Answer:** the same district rows as §1 in a flat export layout. Wrong credentials → `401 { "success": false, "message": "Unauthorized: Invalid credentials" }`.

---

## 22. FTP-source reads (legacy parallel set)

A duplicate set of the §1 fetches, backed by the FTP-ingested tables instead of the primary ones. Kept for comparison and legacy consumers.
Source: [controllers/ftp/](../controllers/ftp/)

| Method | Endpoint | Body | What it gives you |
|---|---|---|---|
| POST | `/fetchDistrictDataFtp` | `{ startDate, endDate }` | District rainfall computed from the FTP-fed tables |
| POST | `/fetchStateDataFtp` | `{ startDate, endDate }` | State rainfall, FTP source |
| POST | `/fetchSubDivisionDataFtp` | `{ startDate, endDate }` | Subdivision rainfall, FTP source |
| POST | `/fetchRegionDataFtp` | `{ startDate, endDate }` | Region rainfall, FTP source |
| POST | `/fetchCountryDataFtp` | `{ startDate, endDate }` | National rainfall, FTP source |
| POST | `/fetchCummulativeRegionDataFtp` | `{ startDate, endDate }` | Cumulative region totals, FTP source |
| POST | `/fetchCummulativeCountryDataFtp` | `{ startDate, endDate }` | Cumulative national totals, FTP source |
| POST | `/getLatestFiveYearDataOfDistrictFtp` | `{ startDate, endDate, district_code }` | Five-year comparison for one district, FTP source |
| POST | `/fetchDistrictDataInBunchOfDatesFtp` | `{ dateRanges: [ { startDate, endDate }, … ] }` | Several non-contiguous windows in a single call |
| POST | `/fetchSubDivisionOfBunchDate` | `{ dateRanges: [...] }` | Same, subdivision level |
| POST | `/fetchFilteredStationUnifiedFileFtp` | `{ startDate, endDate, districtCodes }` | Unified station file from the FTP tables |
| POST | `/fetchLatestAwsExcelData` | — | Most recent AWS Excel drop parsed into rows |

**Useful for:** "the FTP number and our number disagree" investigations — run the same range through both and diff.

**Example question — "Fetch several non-contiguous windows in one call."**

```bash
curl -X POST http://localhost:3000/api/v1/fetchDistrictDataInBunchOfDatesFtp \
  -H "Content-Type: application/json" \
  -d '{"dateRanges":[{"startDate":"2026-06-01","endDate":"2026-06-30"},
                     {"startDate":"2026-07-01","endDate":"2026-07-31"}]}'
```

---

## 23. ⚠️ Endpoints that look like reads but are NOT

These are `GET` (or read-sounding) but **mutate data, send mail, or write files**. Do not call them to "just have a look".

| Method | Endpoint | What it actually does |
|---|---|---|
| GET | `/nDistrictPrev` | Computes and **INSERTs** district normals |
| GET | `/nStatePrev` | INSERTs state normals |
| GET | `/nSubDivisionPrev` | INSERTs subdivision normals |
| GET | `/nRegionPrev` | INSERTs region normals |
| GET | `/nCountryPrev` | INSERTs country normals |
| GET | `/insertStationData` | Inserts station daily data |
| GET | `/createStationDetailsTable` | Creates/populates a table |
| GET | `/insertLatLongInStationDetails` | Updates station coordinates |
| GET | `/AddDailyStationData` | Test route that inserts daily data |
| GET | `/dailyDataUpdateReminderQuery` | **Sends reminder emails** |
| GET | `/dailyDataVerificationReminder` | **Sends verification emails** |
| POST | `/visitor/track` | Records a visit |
| POST | `/aws-station/store-override` · `/store-continue` · `/store-cron` · `/run-daily-store` | Rewrites `aws_station_daily_data` — destructive |
| POST | `/aggregateRainfallData` | Recomputes and writes aggregates |
| POST | `/maps/capture-maps` · `/capture-full-page` · `/download-image` | Writes image files to disk |
| DELETE | `/maps/clear-cache` | Deletes cached images |

---

## Routes defined but not mounted

Present in `routes/` but never `app.use`-d in [index.js](../index.js), so they return 404 in the running server:

- `routes/routeAccessRoutes.js` → `POST /get-allowed-routes` (body `{ mcorhq_type }`; would return `{ success, mcorhq_type, allowedRoutes, count }`)
- `routes/normalsRoutes.js` → `/nRegionPrev`, `/nCountryPrev` (both also reachable via the region/country routers)

---

## Cheat sheet — question → endpoint

| If you want to know… | Call |
|---|---|
| Rainfall + departure per district | `POST /fetchDistrictData` |
| …with AWS stations included | `POST /fetchDistrictDataWithAWS` |
| Whether the numbers are IMD-only or IMD+AWS | `GET /calculations-mode` |
| How many stations actually reported | `POST /fetchDistrictStationCount`, `POST /fetchCentreStationSummary` |
| Wettest places in a period | `POST /fetchTopNDistricts`, `GET /top-rainfall-stations` |
| Whether rain was widespread or isolated | `GET /getSpatialDistributionData` |
| Where the monsoon was vigorous | `POST /monsoon-activity` |
| A single station's history | `POST /fetchAllDatesAndDataOfStation` |
| Neighbours of a suspicious reading | `POST /fetchStationDataInRadius` |
| Who edited a value after publication | `POST /fetchRevisionLogByCentre` |
| Whether the AWS feeds are healthy | `POST /aws-realtime/sources`, `POST /aws-realtime/timeline` |
| AWS stations sending unusable data | `POST /aws-realtime/unmapped-stations` |
| Whether data entry is frozen | `GET /data-entry-lock` |
| What normals are missing | `GET /getMissingDistrictNormals?year=` |
| How big the database is | `GET /getDbInfo` |
| What cron jobs exist | `GET /cron-schedules` |
| Who did what in the admin panel | `GET /admin/activity-logs` |
