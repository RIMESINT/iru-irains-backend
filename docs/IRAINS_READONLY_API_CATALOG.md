# iRAINS Backend — Read-Only (Fetch) API Catalog

Every API in this backend that **only reads** data — nothing is inserted, updated or deleted.
Includes both `GET` endpoints and the many `POST` endpoints that are reads in disguise
(this codebase sends filters in the request body, so most fetches are `POST`).

> **Chatbot note:** Varsha / Ollama uses a *subset* of these APIs via [`IRAINS_API_CATALOG.md`](./IRAINS_API_CATALOG.md) + allowlist in `controllers/ollamaChat/catalogLoader.js`. This file is the full read-only reference.

- **Base URL:** `http(s)://<host>:<PORT>/api/v1` (`PORT` defaults to `3000`)
- **Map routes only:** `http(s)://<host>:<PORT>/api/v1/maps`
- **Entry point:** `index.js` (`app.js` is legacy and is *not* what runs)
- **Auth:** none on these routes, except `*APIexport` / NWP family (`user`/`pass` in body)
- **Date format:** `YYYY-MM-DD`
- **Default dates:** most rainfall endpoints fall back to *today* when dates omitted
- **Standard envelope:** `{ success: true, message, data }`

---

## Quick index

| # | Section | What it answers |
|---|---------|-----------------|
| 1 | Rainfall by admin level | District/state/region rainfall + departure |
| 2 | IMD + AWS combined | Same with AWS stations folded in |
| 3 | Coverage & counts | How many stations reported |
| 4 | Master lists | Dropdown / geography metadata |
| 5 | Normals | Long-period normals |
| 6 | Station data | Raw per-station readings |
| 7 | Revision log | Who changed what |
| 8 | Top-N & range statistics | Wettest N / period stats |
| 9 | Monsoon activity | Vigorous / active / weak |
| 10 | Spatial distribution | Widespread / scattered / dry |
| 11 | State AWS feeds | UP, NHP, Zomato, Karnataka … |
| 12 | AWS realtime analytics | Feed health, unmapped stations |
| 13 | Calculations mode | IMD vs IMD+AWS |
| 14 | Station dashboard | Network metrics |
| 15 | Admin panel | Visitors, exclusions, DB info |
| 16 | GeoJSON | Map boundaries |
| 17 | PDF & documents | Stored documents / bulletin jobs |
| 18 | Map images | Product map image URLs |
| 19 | Email reads | Mail logs and groups |
| 20 | Chat | Natural-language rainfall Q&A |
| 21 | Credential-gated exports | CWC / NWP feeds |
| 22 | FTP-source reads | Legacy parallel set |
| 23 | Not read-only | GETs that write — don't call casually |

---

## 1. Rainfall by administrative level

| Method | Endpoint | Level |
|---|---|---|
| POST | `/fetchBlockData` | Block |
| POST | `/fetchDistrictData` | District |
| POST | `/fetchSubDivisionData` | Subdivision |
| POST | `/fetchStateData` | State |
| POST | `/fetchRegionData` | Region |
| POST | `/fetchCountryData` | Country |
| POST | `/fetchCummulativeRegionData` | Region cumulative |
| POST | `/fetchCummulativeCountryData` | Country cumulative |
| POST | `/fetchBlockRainfallAnalysis` | Block + categories |
| POST | `/getLatestFiveYearDataOfDistrict` | District 5-year window — `{ startDate, endDate, district_code }` |

Body: `{ startDate, endDate }` (omit both for today).

**Chat example:** “How much rain did every district get 1–7 Aug?” → `POST /fetchDistrictData`

---

## 2. Rainfall including AWS (IMD + AWS)

| Method | Endpoint |
|---|---|
| POST | `/fetchBlockDataWithAWS` |
| POST | `/fetchDistrictDataWithAWS` |
| POST | `/fetchSubDivisionDataWithAWS` |
| POST | `/fetchStateDataWithAWS` |
| POST | `/fetchRegionDataWithAWS` |
| POST | `/fetchCountryDataWithAWS` |

Same body/shape as §1. Pair with `GET /calculations-mode` (§13).

---

## 3. Coverage & reporting counts

| Method | Endpoint |
|---|---|
| POST | `/fetchBlockStationCount` |
| POST | `/fetchDistrictStationCount` |
| POST | `/fetchSubDivisionDistrictCount` |
| POST | `/fetchStateDistrictCount` |
| POST | `/fetchRegionCoverageCount` |
| POST | `/fetchCountryCoverageCount` |
| POST | `/fetchCentreStationSummary` |

Body: `{ startDate, endDate }`.

**Chat example:** “Which MCs still have stations missing?” → `POST /fetchCentreStationSummary`

---

## 4. Master lists & geography

| Method | Endpoint |
|---|---|
| GET | `/getAllBlocks` |
| GET | `/getAllDistrict` |
| GET | `/getAllSubDivisions` |
| GET | `/getAllStates` |
| GET | `/getAllRegions` |
| GET | `/getAllStations` |
| GET | `/fetchMetWiseStates` |
| GET | `/metWiseSubDivisions` |
| GET | `/getDistrictAreaPercentages` (also state/subdivision/region variants) |
| GET | `/getNormalDistrictDetails` |
| GET | `/getDistrictDisplayOrder` (also state/subdivision) |
| POST | `/getCenterDetails` — `{ centre_type: "MC"\|"RMC"\|"HQ" }` |

---

## 5. Normals (reads)

Per level: list / normals / download template / missing  
Blocks, districts, states, subdivisions, regions, country.  
Example: `GET /getMissingDistrictNormals?year=2026`

---

## 6. Station-level daily data

| Method | Endpoint | Body |
|---|---|---|
| POST | `/fetchStationData` | `{ Date }` |
| POST | `/fetchStationDataIncludingVerification` | `{ Date }` |
| POST | `/fetchInRangeStationdata` | `{ fromDate, toDate }` |
| POST | `/fetchStationDataEntryRange` | `{ fromDate, toDate }` |
| POST | `/fetchAllDatesAndDataOfStation` | `{ station_id }` |
| POST | `/fetchStationDataInRadius` | `{ Date, lat, long, range }` |
| POST | `/fetchStationWithMaxRainfall` | `{ startDate, endDate, limit }` |
| POST | `/fetchFilteredStationUnifiedFile` | `{ startDate, endDate, districtCodes }` |
| POST | `/dataActions` | `{ startDate }` |
| GET | `/fetchStationLogs` | — |

**Chat example:** “Heavy Rainfall stations 1–7 Aug” → `POST /fetchStationWithMaxRainfall`

> **Note:** `/fetchTopNDistricts` etc. require an entity **code** and return top **days for one place**, not nationwide wettest districts. For nationwide rankings, chat uses `fetchDistrictData` + `rank_by_actual` (or day-wise threshold queries).

---

## 7. Revision log

| Method | Endpoint |
|---|---|
| POST | `/fetchRevisionLog` |
| POST | `/fetchRevisionStationDetails` |
| POST | `/fetchRevisionLogByCentre` |
| POST | `/fetchCentreRevisionDetails` |
| POST | `/fetchRevisionEventsForDate` |
| POST | `/fetchRevisionLogExport` |
| POST | `/fetchRevisionStationMap` |

---

## 8. Top-N and range statistics

| Method | Endpoint | Notes |
|---|---|---|
| POST | `/fetchTopNBlocks` … `/fetchTopNCountries` | Needs entity code — top days for that entity |
| POST | `/fetchBlockRangeStatistics` … `/fetchCountryRangeStatistics` | Min/max/avg/total over period |
| GET | `/top-rainfall-stations` | `?days=30&topN=100` |

---

## 9. Monsoon activity

| Method | Endpoint | Body |
|---|---|---|
| POST | `/monsoon-activity` | `{ date }` subdiv |
| POST | `/monsoon-activity-district` | `{ date }` |
| POST | `/monsoon-activity-subdiv-last7` | `{ date }` |
| POST | `/monsoon-activity-subdiv-last30` | `{ date }` |
| POST | `/monsoon-activity-district-last7` | `{ date }` |
| POST | `/monsoon-activity-district-last30` | `{ date }` |

---

## 10. Spatial distribution

| Method | Endpoint | Query |
|---|---|---|
| GET | `/getSpatialDistributionData` | `startDate`+`endDate` (preferred), `mode=daywise\|period` |
| GET | `/getSpatialDistributionDataState` | same |

---

## 11. State AWS / ARG feeds

Prefixes: `/up-aws`, `/nhp-aws`, `/zomato-aws`, `/meghalaya-aws`, `/mizoram-aws`, `/tamilnadu-aws`, `/uttarakhand-aws`, `/telangana-aws`, `/karnataka-aws`, `/iitm-mumbai`

Per source (POST): `/daily`, `/hourly`, `/slot`, `/cumulative`, `/district-summary`, `/station-slots`, `/actual-departure`, `/departure-analysis`, `/departure-export`

Also: `/state-aws/fetchFilteredStationUnifiedFile`, `/aws-station/fetchFilteredStationUnifiedFile`

---

## 12. AWS realtime analytics

| Method | Endpoint |
|---|---|
| POST | `/aws-realtime/filters` |
| POST | `/aws-realtime/sources` |
| POST | `/aws-realtime/unmapped-stations` |
| POST | `/aws-realtime/timeline` |
| POST | `/aws-realtime/cumulative` |
| POST | `/aws-realtime/station-series` |
| POST | `/fetchAwsSourceLogs` |

---

## 13. Calculations mode

| Method | Endpoint |
|---|---|
| GET | `/calculations-mode` |
| POST | `/fetchCalcModeStations` |
| POST | `/fetchCalcModeCountryRange` |
| POST | `/fetchCalcModeStationsPivot` |

---

## 14–19. Dashboard / admin / geo / PDF / maps / email

See routes under `/station-dashboard/*`, `/visitor/*`, `/calculation-exclusion/*`, `/admin/*`, `/getDbInfo`, `/cron-schedules`, `/data-entry-lock`, `/geojson/*`, PDF generators, `/maps/*`, `/fetchEmailLogs`, `/fetchEmailGroups`.

---

## 20. Rainfall chat (LLM)

| Method | Endpoint | Body |
|---|---|---|
| GET | `/ollama-chat/health` | — |
| POST | `/ollama-chat` | `{ question, skipAnswerLlm?, previous_question? }` |
| GET/POST | `/rainfall-chat(/*)` | Alias of above |

---

## 21–22. Exports & FTP reads

Credential-gated: `/fetch*DataAPIexport`, `/station_data_for_nwp*`, `/<source>-aws/departure-export`  
FTP parallel: `/fetchDistrictDataFtp`, …, `/fetchDistrictDataInBunchOfDatesFtp`, etc.

---

## 23. ⚠️ Not read-only (do not call casually)

`GET /nDistrictPrev`, `/insertStationData`, `/dailyDataUpdateReminderQuery`, `POST /visitor/track`, `POST /aws-station/store-*`, `POST /aggregateRainfallData`, `POST /maps/capture-*`, `DELETE /maps/clear-cache`, etc.

---

## Cheat sheet — question → endpoint

| If you want… | Call |
|---|---|
| Rainfall + departure per district | `POST /fetchDistrictData` |
| …with AWS included | `POST /fetchDistrictDataWithAWS` |
| IMD-only or IMD+AWS mode? | `GET /calculations-mode` |
| Stations that reported | `POST /fetchDistrictStationCount`, `POST /fetchCentreStationSummary` |
| Wettest places (nationwide chat) | `fetchDistrictData` + rank / threshold (not raw `/fetchTopNDistricts`) |
| Heavy Rainfall stations | `POST /fetchStationWithMaxRainfall` or `GET /top-rainfall-stations` |
| Widespread vs isolated | `GET /getSpatialDistributionData` |
| Monsoon vigorous where? | `POST /monsoon-activity` |
| Neighbours of a reading | `POST /fetchStationDataInRadius` |
| Who edited after publish | `POST /fetchRevisionLogByCentre` |
| AWS feed health | `POST /aws-realtime/sources` |
| Data entry locked? | `GET /data-entry-lock` |
| Free-text Q | `POST /ollama-chat` |
