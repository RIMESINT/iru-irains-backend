# IRAINS Product API Catalog (for LLM / Ollama)

This file is the **source of truth** for mapping user questions → API calls.

- Use **ONLY** APIs listed here.
- Never invent endpoints, `api_id` values, fields, or rainfall numbers.
- Valid `api_id` examples: `fetch_district_data`, `fetch_state_data`, `fetch_country_data`, `resolve_product_route` — never invent names like `fetch_catalog_data`.
- If a question is outside listed APIs, ask the user to rephrase.
- Base URL (local): `http://localhost:3000/api/v1`

---

## Product modules (roadmap)

| Module | Status in this file | Purpose |
|--------|---------------------|---------|
| Rainfall | **Active** | Actual / normal / departure / deficient / excess |
| Navigation | **Active** | “Where is this product?” → product name + frontend route |
| Stations | Planned | Station master, daily entry, top stations |
| Spatial distribution | Planned | Isolated / Scattered / Widespread |
| Monsoon activity | Planned | Weak / Active / Vigorous |
| AWS networks | Planned | State AWS rainfall & departure |
| PDF / Email reports | Planned | Report generation & dissemination |
| Admin / exclusions | Planned | Calculation exclusions, publish, locks |
| Maps / GeoJSON | Planned | Map layers and geo files |

> Chat supports **Rainfall** data questions and **Navigation** product routing.  
> Other modules will be added in the same format later.

---

## LLM output contract (required)

When the user asks a **rainfall / data** question, respond with JSON only (no markdown outside JSON):

```json
{
  "module": "rainfall",
  "api_id": "fetch_state_data",
  "method": "POST",
  "path": "/api/v1/fetchStateData",
  "body": {
    "startDate": "2026-07-29",
    "endDate": "2026-07-29"
  },
  "query": {},
  "post_filter": {
    "state_name": "Kerala"
  },
  "post_process": null,
  "reason": "User asked Kerala rainfall for a date"
}
```

When the user asks **where a product / map / menu is** (navigation), respond with:

```json
{
  "module": "navigation",
  "api_id": "resolve_product_route",
  "method": "NAV",
  "path": null,
  "body": {},
  "query": {},
  "post_filter": {},
  "post_process": null,
  "product_name": "Daily Actual State Rainfall Map",
  "route_path": "/daily-actual-state-map",
  "reason": "User asked where the daily actual state rainfall map is"
}
```

### Field meanings

- `module`: product area (`rainfall`, `navigation`, later `stations`, etc.)
- `api_id`: id from this catalog (`resolve_product_route` for navigation)
- `method`: `GET`, `POST`, or `NAV` (navigation only — no HTTP call)
- `path`: exact API path from catalog (null for navigation)
- `body`: JSON body for POST (empty object if none)
- `query`: query params for GET (empty object if none)
- `post_filter`: filter API response rows in backend (e.g. one state/district)
- `post_process`: optional extra step after fetch (see Rainfall rules)
- `product_name` / `route_path`: **required for navigation** — frontend menu title + direct route
- `reason`: short why this API/route was chosen

### Date rules

- Date format: `YYYY-MM-DD`
- If user says **today** / no date → use `"TODAY"` for both `startDate` and `endDate`
- If user says **yesterday** → use `"YESTERDAY"`
- If user says **last 7 days** / **this week** → `startDate: "LAST_7_START"`, `endDate: "TODAY"`
- If user says **seasonal / cumulative so far** (SW monsoon) → `startDate: "SEASON_START"`, `endDate: "TODAY"`
- If user gives one date → `startDate = endDate = that date`
- If user gives a range → use `startDate` and `endDate`
- Parse natural dates like `20th June`, `10 May 2026`, `01-Jul`, `15-Jul`
- **Whole month (CRITICAL):** phrases like `month of June`, `during June`, `in June`, `for June`, `throughout June` (no day number) → `startDate` = 1st of that month, `endDate` = last day of that month. Example: June → `2026-06-01` to `2026-06-30`. **Never** use only the 1st for a whole-month question.
- Month name without year → use current server year

### Entity resolution

- District → `fetch_district_data` + `post_filter.district_name`
- State → `fetch_state_data` + `post_filter.state_name`
- Subdivision → `fetch_subdivision_data` + `post_filter.subdiv_name`
- Country / all-India → `fetch_country_data` (no name filter)
- Compare two states → `fetch_state_data` + `post_filter.state_names: ["Tamil Nadu", "Kerala"]`

---

# Module: Rainfall (ACTIVE)

## Departure categories (IMD)

Use these after district/state/subdivision departure is available:

| Category | Departure % |
|----------|-------------|
| Large Excess | >= 60 |
| Excess | 20 to 59 |
| Normal | -19 to 19 |
| Deficient | -59 to -20 |
| Large Deficient | -99 to -60 |
| No Rain | exactly -100 |
| No Data | null / missing |

### Common chat intents → API

| # | User intent | api_id | Notes |
|---|-------------|--------|-------|
| 1 | Today’s rainfall for district / state / subdivision | matching `fetch_*_data` | `post_filter` by name; dates `TODAY` |
| 2 | Departure from normal for a state today | `fetch_state_data` | present `departure` |
| 3 | Actual vs Departure for date range | matching `fetch_*_data` | keep actual + departure |
| 4 | Districts deficient / large deficient today | `fetch_district_data` | category filter |
| 5 | Districts excess / large excess today | `fetch_district_data` | category filter |
| 6 | Country / all-India rainfall today | `fetch_country_data` | no name filter |
| 7 | Last 7 days / this week | matching `fetch_*_data` | `LAST_7_START` → `TODAY` |
| 8 | Seasonal / cumulative so far | `fetch_cumulative_country_data` or range fetch | `SEASON_START` → `TODAY` |
| 9 | Actual, normal, % departure for a district range | `fetch_district_data` | filter district + dates |
| 10 | Compare state A vs state B | `fetch_state_data` | `state_names` array |

For deficient/excess / large excess, set **`post_process` only** (not `post_filter`):

```json
"post_process": {
  "type": "filter_by_departure_category",
  "categories": ["Deficient", "Large Deficient"]
}
```

Wrong (returns empty): `"post_filter": { "departure_category": "Large Excess" }`  
Correct: empty `post_filter` + `post_process` as above.

---

## Rainfall APIs

### 1) fetch_district_data
- **Purpose:** District-wise actual rainfall, normal, and departure for a date/range.
- **When to use:** District rainfall; all-district deficient/excess lists; district departure.
- **Method:** `POST`
- **Path:** `/api/v1/fetchDistrictData`
- **Body:**
  - `startDate` (string, YYYY-MM-DD)
  - `endDate` (string, YYYY-MM-DD)
- **Response (main fields in `data[]`):**
  - `district_name`
  - `district_code`
  - `state_code`
  - `sub_division_code`
  - `actual_rainfall`
  - `normal_rainfall`
  - `departure`
- **post_filter examples:**
  - `{ "district_name": "Pune" }`
  - `{ "state_code": "..." }` (if known)

### 2) fetch_state_data
- **Purpose:** State-wise actual rainfall, normal, and departure.
- **When to use:** State rainfall / departure (Maharashtra, Kerala, etc.).
- **Method:** `POST`
- **Path:** `/api/v1/fetchStateData`
- **Body:**
  - `startDate`
  - `endDate`
- **Response (main fields in `data[]`):**
  - `state_name`
  - `state_code`
  - `region_code`
  - `actual_state_rainfall`
  - `rainfall_normal_value`
  - `departure`
- **post_filter examples:**
  - `{ "state_name": "Maharashtra" }`
  - `{ "state_name": "Kerala" }`

### 3) fetch_subdivision_data
- **Purpose:** Meteorological subdivision rainfall and departure.
- **When to use:** User asks for a subdivision (not district/state).
- **Method:** `POST`
- **Path:** `/api/v1/fetchSubDivisionData`
- **Body:**
  - `startDate`
  - `endDate`
- **Response (main fields in `data[]`):**
  - `subdiv_name`
  - `s_code`
  - `region_code`
  - `actual_subdiv_rainfall`
  - `rainfall_normal_value`
  - `departure`
- **post_filter examples:**
  - `{ "subdiv_name": "Konkan & Goa" }`

### 4) fetch_region_data
- **Purpose:** Region-wise rainfall and departure.
- **When to use:** User asks rainfall/departure for a region.
- **Method:** `POST`
- **Path:** `/api/v1/fetchRegionData`
- **Body:**
  - `startDate`
  - `endDate`
- **Response (main fields):**
  - `name` (region name)
  - `r_code`
  - `actual_rainfall`
  - `rainfall_normal_value`
  - `departure`

### 5) fetch_country_data
- **Purpose:** Country-level rainfall and departure (India aggregate).
- **When to use:** User asks all-India / country rainfall (daily or short range).
- **Method:** `POST`
- **Path:** `/api/v1/fetchCountryData`
- **Body:**
  - `startDate`
  - `endDate`

### 5b) fetch_cumulative_country_data
- **Purpose:** Cumulative / seasonal country rainfall between two dates.
- **When to use:** “seasonal rainfall so far”, “cumulative all-India”, monsoon-to-date.
- **Method:** `POST`
- **Path:** `/api/v1/fetchCummulativeCountryData`
- **Body:**
  - `startDate` (use `"SEASON_START"` for SW monsoon-to-date)
  - `endDate` (usually `"TODAY"`)

### 6) fetch_block_data
- **Purpose:** Block-level actual / normal / departure.
- **When to use:** User asks block rainfall.
- **Method:** `POST`
- **Path:** `/api/v1/fetchBlockData`
- **Body:**
  - `startDate`
  - `endDate`

### 7) fetch_block_rainfall_analysis
- **Purpose:** Block rainfall analysis with category counts (deficient/excess summary style).
- **When to use:** User wants category summary / analysis at block level.
- **Method:** `POST`
- **Path:** `/api/v1/fetchBlockRainfallAnalysis`
- **Body:**
  - `startDate`
  - `endDate`
- **Response notes:** includes category counts and stats.

### 8) get_all_districts
- **Purpose:** List districts (master list).
- **When to use:** Need district names/codes for resolution (not daily rainfall values).
- **Method:** `GET`
- **Path:** `/api/v1/getAllDistrict`
- **Body:** none

### 9) get_all_states
- **Purpose:** List states.
- **When to use:** Resolve state names/codes.
- **Method:** `GET`
- **Path:** `/api/v1/getAllStates`
- **Body:** none

### 10) get_all_subdivisions
- **Purpose:** List subdivisions.
- **When to use:** Resolve subdivision names/codes.
- **Method:** `GET`
- **Path:** `/api/v1/getAllSubDivisions`
- **Body:** none

### 11) get_latest_five_year_district *(not yet enabled in chat allowlist — do not use)*
- **Purpose:** Latest five-year monthly rainfall/departure for one district.
- **When to use:** Multi-year district trend questions (planned).
- **Method:** `POST`
- **Path:** `/api/v1/getLatestFiveYearDataOfDistrict`
- **Body:** includes district identifier (as required by API) + date context if needed.

### 12) top_rainfall_stations
- **Purpose:** Top rainfall stations for recent days.
- **When to use:** “Which stations got highest rainfall?”
- **Method:** `GET`
- **Path:** `/api/v1/top-rainfall-stations`
- **Query:**
  - `days` (optional)
  - `topN` (optional)

### Optional AWS-inclusive variants
Use only if user explicitly asks including AWS:

| api_id | Method | Path |
|--------|--------|------|
| fetch_district_data_with_aws | POST | `/api/v1/fetchDistrictDataWithAWS` |
| fetch_state_data_with_aws | POST | `/api/v1/fetchStateDataWithAWS` |
| fetch_subdivision_data_with_aws | POST | `/api/v1/fetchSubDivisionDataWithAWS` |
| fetch_region_data_with_aws | POST | `/api/v1/fetchRegionDataWithAWS` |
| fetch_country_data_with_aws | POST | `/api/v1/fetchCountryDataWithAWS` |
| fetch_block_data_with_aws | POST | `/api/v1/fetchBlockDataWithAWS` |

Same body pattern: `{ startDate, endDate }`.

---

## Rainfall example mappings (training set A)

Use these as few-shot patterns. Replace date tokens with real dates when the user gives specific dates.

### Q1 — Today’s rainfall for district / state / subdivision
User: `What is today’s rainfall for Maharashtra?`  
→

```json
{
  "module": "rainfall",
  "api_id": "fetch_state_data",
  "method": "POST",
  "path": "/api/v1/fetchStateData",
  "body": { "startDate": "TODAY", "endDate": "TODAY" },
  "query": {},
  "post_filter": { "state_name": "Maharashtra" },
  "post_process": null,
  "reason": "State rainfall for today"
}
```

User: `What is today’s rainfall for Pune district?` → `fetch_district_data` + `post_filter.district_name: "Pune"`.  
User: `What is today’s rainfall for Konkan & Goa?` → `fetch_subdivision_data` + `post_filter.subdiv_name`.

### Q2 — Departure from normal
User: `What is the departure from normal for Maharashtra today?`  
→ same as Q1 (`fetch_state_data`); answer highlights `departure`.

### Q3 — Actual vs Departure date range
User: `Show Actual vs Departure for Maharashtra from 2026-05-01 to 2026-05-10`  
→

```json
{
  "module": "rainfall",
  "api_id": "fetch_state_data",
  "method": "POST",
  "path": "/api/v1/fetchStateData",
  "body": { "startDate": "2026-05-01", "endDate": "2026-05-10" },
  "query": {},
  "post_filter": { "state_name": "Maharashtra" },
  "post_process": null,
  "reason": "Date-range actual and departure for a state"
}
```

### Q4 — Deficient / Large Deficient districts
User: `Which districts are deficient / large deficient today?`  
→

```json
{
  "module": "rainfall",
  "api_id": "fetch_district_data",
  "method": "POST",
  "path": "/api/v1/fetchDistrictData",
  "body": { "startDate": "TODAY", "endDate": "TODAY" },
  "query": {},
  "post_filter": {},
  "post_process": {
    "type": "filter_by_departure_category",
    "categories": ["Deficient", "Large Deficient"]
  },
  "reason": "Need district departures then filter deficient categories"
}
```

### Q5 — Excess / Large Excess districts
User: `Which districts are in excess / large excess today?`  
→ same as Q4 with categories `["Excess", "Large Excess"]`.

### Q5b — Large Excess for a whole month (IMPORTANT)
User: `can u give me the districts which has large excess during the month of June`  
→ Use **`post_process`** (never put category in `post_filter`):

```json
{
  "module": "rainfall",
  "api_id": "fetch_district_data",
  "method": "POST",
  "path": "/api/v1/fetchDistrictData",
  "body": { "startDate": "2026-06-01", "endDate": "2026-06-30" },
  "query": {},
  "post_filter": {},
  "post_process": {
    "type": "filter_by_departure_category",
    "categories": ["Large Excess"]
  },
  "reason": "Month-of-June district departures filtered to Large Excess only"
}
```

Rules:
- Month name without year → use current server year (`June` → `YYYY-06-01` to `YYYY-06-30`).
- Category filters MUST use `post_process.filter_by_departure_category`.
- Do **not** use `post_filter.departure_category` (that field does not exist on API rows).

### Q6 — Country / all-India
User: `What is country / all-India rainfall today?`  
→

```json
{
  "module": "rainfall",
  "api_id": "fetch_country_data",
  "method": "POST",
  "path": "/api/v1/fetchCountryData",
  "body": { "startDate": "TODAY", "endDate": "TODAY" },
  "query": {},
  "post_filter": {},
  "post_process": null,
  "reason": "All-India country rainfall for today"
}
```

### Q7 — Last 7 days / this week
User: `What is rainfall for last 7 days / this week?`  
→

```json
{
  "module": "rainfall",
  "api_id": "fetch_country_data",
  "method": "POST",
  "path": "/api/v1/fetchCountryData",
  "body": { "startDate": "LAST_7_START", "endDate": "TODAY" },
  "query": {},
  "post_filter": {},
  "post_process": null,
  "reason": "Country rainfall for trailing 7 days; if user names a state/district, use that fetch_* instead"
}
```

### Q8 — Seasonal / cumulative so far
User: `What is seasonal / cumulative rainfall so far?`  
→

```json
{
  "module": "rainfall",
  "api_id": "fetch_cumulative_country_data",
  "method": "POST",
  "path": "/api/v1/fetchCummulativeCountryData",
  "body": { "startDate": "SEASON_START", "endDate": "TODAY" },
  "query": {},
  "post_filter": {},
  "post_process": null,
  "reason": "SW monsoon cumulative all-India from season start to today"
}
```

### Q9 — District actual / normal / departure for range
User: `Give actual, normal and % departure for Chennai district from 01-Jul to 15-Jul.`  
→

```json
{
  "module": "rainfall",
  "api_id": "fetch_district_data",
  "method": "POST",
  "path": "/api/v1/fetchDistrictData",
  "body": { "startDate": "2026-07-01", "endDate": "2026-07-15" },
  "query": {},
  "post_filter": { "district_name": "Chennai" },
  "post_process": null,
  "reason": "District range rainfall with actual, normal, departure"
}
```

### Q10 — Compare two states
User: `Compare rainfall of Tamil Nadu vs Kerala for yesterday.`  
→

```json
{
  "module": "rainfall",
  "api_id": "fetch_state_data",
  "method": "POST",
  "path": "/api/v1/fetchStateData",
  "body": { "startDate": "YESTERDAY", "endDate": "YESTERDAY" },
  "query": {},
  "post_filter": { "state_names": ["Tamil Nadu", "Kerala"] },
  "post_process": null,
  "reason": "Compare two states for yesterday"
}
```

### Extra — typo tolerance
User: `What is the rainfall of Kerela on 20th june?`  
→

```json
{
  "module": "rainfall",
  "api_id": "fetch_state_data",
  "method": "POST",
  "path": "/api/v1/fetchStateData",
  "body": { "startDate": "2026-06-20", "endDate": "2026-06-20" },
  "query": {},
  "post_filter": { "state_name": "Kerala" },
  "post_process": null,
  "reason": "Kerela is typo for Kerala; single-date state rainfall"
}
```

---

# Module: Navigation (ACTIVE)

Use when the user asks **where** a product/map/report/menu is, or to **open** a screen.  
Do **not** call rainfall APIs. Return `product_name` + `route_path` exactly from this table.

**Ambiguous map (CRITICAL):** If the user only says `map`, `maps`, `show map`, `open map`, `which map` (no specific product name), do **not** pick a default map. Return:

```json
{
  "module": "navigation",
  "api_id": "resolve_product_route",
  "method": "NAV",
  "path": null,
  "body": {},
  "query": {},
  "post_filter": {},
  "post_process": null,
  "product_name": null,
  "route_path": null,
  "reason": "ambiguous_map"
}
```

The backend will ask which map they want and list options.

| # | User question (patterns) | product_name | route_path |
|---|--------------------------|--------------|------------|
| 11 | daily actual state rainfall map | Daily Actual State Rainfall Map | `/daily-actual-state-map` |
| 12 | daily departure district (Pan India) map | Daily Departure District (Pan India) Map | `/daily-departure-district-map` |
| 13 | weekly departure homogenous map | Weekly Departure Homogenous Map | `/weekly-departure-homogenous` |
| 14 | cumulative departure country map | Cumulative Departure Country Map | `/cumulative-departure-country` |
| 15 | block rainfall map (actual / AWS) | Block Rainfall Map (Actual / AWS) | `/block-rainfall-map` |
| 16 | monsoon activity | Monsoon Activity | `/monsoon-activity` |
| 17 | spatial distribution / spatial table | Spatial Distribution Table | `/spatial-distribution-table` |
| 18 | station level data | Station Level Data | `/station-level-data` |
| 19 | station statistics | Station Statistics | `/station-statistics` |
| 20 | data entry / verification | Data Entry / Verification | `/data-entry-verification` |
| 21 | annual–seasonal–monthly maps | Annual–Seasonal–Monthly Maps | `/maps/annual-seasonal-monthly` |
| 22 | All Maps home overview | All Maps Overview | `/all-maps-overview` |
| 23 | PDF rainfall report download | PDF Rainfall Report Download | `/reports/pdf-download` |
| 24 | email dissemination / send reports | Email Dissemination | `/email-dissemination` |
| 25 | MC/RMC state / subdiv / region map | MC/RMC Regional Maps | `/mc-rmc-regional-maps` |

### Navigation example

User: `Where is the daily actual state rainfall map?`  
→

```json
{
  "module": "navigation",
  "api_id": "resolve_product_route",
  "method": "NAV",
  "path": null,
  "body": {},
  "query": {},
  "post_filter": {},
  "post_process": null,
  "product_name": "Daily Actual State Rainfall Map",
  "route_path": "/daily-actual-state-map",
  "reason": "Product location question"
}
```

User: `Open daily departure district (Pan India) map.`  
→ same shape with `product_name: "Daily Departure District (Pan India) Map"`, `route_path: "/daily-departure-district-map"`.

If the product is not in the table, still use `module: "navigation"` but set `route_path` to `null` and `reason` explaining it is unknown.

---

# Module: Stations (PLANNED)

> Add later: station list, station daily data, verification, top stations details.

# Module: Spatial distribution (PLANNED)

> Add later:
> - `GET /api/v1/getSpatialDistributionData`
> - `GET /api/v1/getSpatialDistributionDataState`

# Module: AWS networks (PLANNED)

> Add later: `/up-aws`, `/karnataka-aws`, `/iitm-mumbai`, departure-analysis, etc.

# Module: Admin (PLANNED)

> Add later: calculation exclusions, review/publish, locks.

---

## Safety rules for executor (backend)

1. Allow only paths present in this catalog (navigation uses `NAV`, no HTTP).
2. Replace date tokens: `TODAY`, `YESTERDAY`, `LAST_7_START`, `SEASON_START`.
3. Do not send secrets to the LLM.
4. After API response, LLM (or formatter) must use returned numbers only.
5. If API returns empty/no data, say data is not available for that date.
6. For navigation, answer with product name + route path only — never invent rainfall numbers.
