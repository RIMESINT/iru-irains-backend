# IRAINS Product API Catalog (for LLM / Ollama)

This file is the **source of truth** for mapping user questions → API calls.

- Use **ONLY** APIs listed here.
- Never invent endpoints, `api_id` values, fields, or rainfall numbers.
- Valid `api_id` examples: `fetch_district_data`, `fetch_state_data`, `fetch_country_data`, `resolve_product_route` — never invent names like `fetch_catalog_data`.
- If a question is outside listed APIs, ask the user to rephrase.
- Base URL (local): `http://localhost:3000/api/v1`
- Full read-only backend reference (all fetch APIs): [`docs/IRAINS_READONLY_API_CATALOG.md`](./IRAINS_READONLY_API_CATALOG.md)

---

## Product modules (roadmap)

| Module | Status in this file | Purpose |
|--------|---------------------|---------|
| Rainfall | **Active** | Actual / normal / departure / deficient / excess |
| Rankings & Extremes | **Active** | Top wettest places, highest rainfall, above-X mm, Heavy Rainfall stations |
| Coverage | **Active** | Station/MC reporting counts |
| IMD+AWS | **Active** | Rainfall with AWS blended; calculations mode |
| Range statistics | **Active** | Period min/max/avg summaries |
| Spatial distribution | **Active** | Isolated / Scattered / Fairly Widespread / Widespread |
| Monsoon activity | **Active** | Weak / Normal / Active / Vigorous / Subdued |
| Navigation | **Active** | “Where is this product?” → product name + frontend route |
| Stations (detail) | **Active** | Named station rainfall; district → district + all stations; same-date history |
| AWS network feeds | Planned | `/up-aws`, `/karnataka-aws`, … (see readonly catalog) |
| PDF / Email / Admin | Planned | See readonly catalog §§15–19 |

> Chat supports **Rainfall**, **Rankings**, **Coverage**, **IMD+AWS**, **Range stats**, **Spatial**, **Monsoon**, and **Navigation**.  
> Broader fetch surface is documented in the readonly catalog.

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

- `module`: product area (`rainfall`, `spatial`, `monsoon`, `navigation`, later `stations`, etc.)
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
| 36 | Top N wettest districts today | `fetch_district_data` | `post_process.rank_by_actual` |
| 37 | Top N wettest states this week | `fetch_state_data` | `LAST_7_START`→`TODAY` + rank |
| 38 | Top wettest blocks / subdivs / regions | matching `fetch_*_data` | `rank_by_actual` |
| 39 | Highest rainfall place yesterday | `fetch_district_data` (or stations) | rank limit 1 / `YESTERDAY` |
| 40 | Districts above X mm today | `fetch_district_data` | `filter_by_actual_min` |

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
(Backend also returns station rainfall rows for every station in that district.)  
User: `What is rainfall at Nungambakkam station today?` → `fetch_station_data` + `post_filter.station_name: "Nungambakkam"`.  
User: `What is today’s rainfall for Konkan & Goa?` → `fetch_subdivision_data` + `post_filter.subdiv_name`.

### Q1b — Same date in previous years (place)
User: `Historical rainfall for Chennai district on 20 August for previous years` →  
`fetch_district_data` + `post_filter.district_name: "Chennai"` + `post_process.type: "same_date_history"` (body date = that calendar day).  
User: `Historical rainfall for Nungambakkam station on 20 August for previous years` →  
`fetch_station_data` + station filter + `same_date_history`.

Related follow-ups the UI may offer after a place answer: previous few days; same date in previous years.

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

### Q5c — Category for ONE place (IMPORTANT)
User: `can u give me the large excess that happened on chenai` / `large excess in Chennai` / `was Chennai deficient yesterday?`

Rules:
- Correct typos in `post_filter` (`chenai` → `Chennai`).
- Keep **both** place filter and category `post_process`.
- Use **only** dates the user said (or `TODAY` / `YESTERDAY` / `LAST_7_START`). **Never** invent example ranges like `2026-07-01` to `2026-07-15`.
- Same pattern for: Large Excess, Excess, Normal, Deficient, Large Deficient, No Rain.

Example (user said today):

```json
{
  "module": "rainfall",
  "api_id": "fetch_district_data",
  "method": "POST",
  "path": "/api/v1/fetchDistrictData",
  "body": { "startDate": "TODAY", "endDate": "TODAY" },
  "query": {},
  "post_filter": { "district_name": "Chennai" },
  "post_process": {
    "type": "filter_by_departure_category",
    "categories": ["Large Excess"]
  },
  "reason": "Check whether Chennai is Large Excess for the given date"
}
```

If Chennai is not in that category, the backend returns no matching rows (do not answer with a different category as if it were Large Excess).

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

User: `Compare Tamil Nadu vs Kerala in JUNE MONTH` →

```json
{
  "module": "rainfall",
  "api_id": "fetch_state_data",
  "method": "POST",
  "path": "/api/v1/fetchStateData",
  "body": { "startDate": "2026-06-01", "endDate": "2026-06-30" },
  "query": {},
  "post_filter": { "state_names": ["Tamil Nadu", "Kerala"] },
  "post_process": null,
  "reason": "Compare Tamil Nadu vs Kerala for June — NEVER monsoon activity"
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

# Module: Rankings & Extremes (ACTIVE)

Use for briefing prep: top wettest places, highest rainfall, rainfall above a threshold.

**IMPORTANT:** Do **not** call `POST /fetchTopNDistricts|States|Blocks|…`. Those APIs require an entity code and return top days for **one** place.  
For nationwide / list rankings, call the normal `fetch_*_data` APIs with **empty** `post_filter` and a ranking `post_process`.

### Ranking post_process

```json
"post_process": {
  "type": "rank_by_actual",
  "limit": 10,
  "order": "desc"
}
```

### Threshold post_process

```json
"post_process": {
  "type": "filter_by_actual_min",
  "min_mm": 100
}
```

| # | User intent | api_id | body dates | post_process |
|---|-------------|--------|------------|--------------|
| 36 | Top 10 wettest districts today | `fetch_district_data` | TODAY–TODAY | `rank_by_actual` limit 10 |
| 37 | Top 5 wettest states this week | `fetch_state_data` | LAST_7_START–TODAY | `rank_by_actual` limit 5 |
| 38a | Top wettest blocks today | `fetch_block_data` | TODAY–TODAY | `rank_by_actual` limit 10 |
| 38b | Top wettest subdivisions today | `fetch_subdivision_data` | TODAY–TODAY | `rank_by_actual` limit 10 |
| 38c | Top wettest regions today | `fetch_region_data` | TODAY–TODAY | `rank_by_actual` limit 10 |
| 39 | Highest rainfall place yesterday | `fetch_district_data` | YESTERDAY–YESTERDAY | `rank_by_actual` limit 1 |
| 39b | Highest rainfall **station** recently | `top_rainfall_stations` | query `days=2`, `topN=5` | optional filter |
| 40 | Districts with rainfall above 100 mm today | `fetch_district_data` | TODAY–TODAY | `filter_by_actual_min` min_mm 100 |

### Ranking examples

User: `Top 10 wettest districts today.` →

```json
{
  "module": "rainfall",
  "api_id": "fetch_district_data",
  "method": "POST",
  "path": "/api/v1/fetchDistrictData",
  "body": { "startDate": "TODAY", "endDate": "TODAY" },
  "query": {},
  "post_filter": {},
  "post_process": { "type": "rank_by_actual", "limit": 10, "order": "desc" },
  "reason": "Top 10 wettest districts today"
}
```

User: `Top 5 wettest states this week.` →

```json
{
  "module": "rainfall",
  "api_id": "fetch_state_data",
  "method": "POST",
  "path": "/api/v1/fetchStateData",
  "body": { "startDate": "LAST_7_START", "endDate": "TODAY" },
  "query": {},
  "post_filter": {},
  "post_process": { "type": "rank_by_actual", "limit": 5, "order": "desc" },
  "reason": "Top 5 wettest states this week"
}
```

User: `Which place recorded the highest rainfall yesterday?` →

```json
{
  "module": "rainfall",
  "api_id": "fetch_district_data",
  "method": "POST",
  "path": "/api/v1/fetchDistrictData",
  "body": { "startDate": "YESTERDAY", "endDate": "YESTERDAY" },
  "query": {},
  "post_filter": {},
  "post_process": { "type": "rank_by_actual", "limit": 1, "order": "desc" },
  "reason": "Highest rainfall district yesterday"
}
```

User: `highest rainfall received on 25th july` →

```json
{
  "module": "rainfall",
  "api_id": "fetch_district_data",
  "method": "POST",
  "path": "/api/v1/fetchDistrictData",
  "body": { "startDate": "2026-07-25", "endDate": "2026-07-25" },
  "query": {},
  "post_filter": {},
  "post_process": { "type": "rank_by_actual", "limit": 5, "order": "desc" },
  "reason": "Highest rainfall districts on 25 July — NEVER monsoon activity"
}
```

User: `List districts with rainfall above 100 mm today.` →

```json
{
  "module": "rainfall",
  "api_id": "fetch_district_data",
  "method": "POST",
  "path": "/api/v1/fetchDistrictData",
  "body": { "startDate": "TODAY", "endDate": "TODAY" },
  "query": {},
  "post_filter": {},
  "post_process": { "type": "filter_by_actual_min", "min_mm": 100 },
  "reason": "Districts with actual >= 100 mm today"
}
```

User: `List districts with rainfall above 50 mm` (no date, all-India) → use last 30 days and return **day-wise rows with date**:

```json
{
  "module": "rainfall",
  "api_id": "fetch_district_data",
  "method": "POST",
  "path": "/api/v1/fetchDistrictData",
  "body": { "startDate": "LAST_30_START", "endDate": "TODAY" },
  "query": {},
  "post_filter": {},
  "post_process": { "type": "filter_by_actual_min", "min_mm": 50 },
  "reason": "All-India districts with actual >= 50 mm in last 30 days (include date on each row)"
}
```

Do **not** ask for a place for nationwide district threshold lists. Do **not** use monsoon APIs.

---

# Module: Spatial distribution (ACTIVE)

Categories: **Isolated** / **Scattered** / **Fairly Widespread** / **Widespread** (and Dry when applicable).

### APIs

| api_id | method | path | query |
|--------|--------|------|-------|
| `get_spatial_distribution_data` | GET | `/api/v1/getSpatialDistributionData` | `startDate`, `endDate` (use same day for today) |
| `get_spatial_distribution_data_state` | GET | `/api/v1/getSpatialDistributionDataState` | `startDate`, `endDate` |

Always send **both** `startDate` and `endDate` (tokens allowed).  
Filter one subdivision with `post_filter.subdivision_name` (or `subdiv_name`).

| # | User intent | api_id | notes |
|---|-------------|--------|-------|
| 41 | Spatial distribution for my subdivision | `get_spatial_distribution_data` | filter by subdivision name |
| 41b | Spatial distribution by state | `get_spatial_distribution_data_state` | optional `post_filter.state_name` |

User: `What is the spatial distribution for Kerala subdivision today?` →

```json
{
  "module": "spatial",
  "api_id": "get_spatial_distribution_data",
  "method": "GET",
  "path": "/api/v1/getSpatialDistributionData",
  "body": {},
  "query": { "startDate": "TODAY", "endDate": "TODAY" },
  "post_filter": { "subdivision_name": "Kerala" },
  "post_process": null,
  "reason": "Spatial category for Kerala subdivision today"
}
```

---

# Module: Monsoon activity (ACTIVE)

Activities: **Weak** / **Normal** / **Active** / **Vigorous** / **Subdued**.

### APIs

| api_id | method | path | body |
|--------|--------|------|------|
| `get_monsoon_activity` | POST | `/api/v1/monsoon-activity` | `{ "date": "TODAY" }` subdiv today |
| `get_monsoon_activity_district` | POST | `/api/v1/monsoon-activity-district` | `{ "date": "TODAY" }` district today |
| `get_monsoon_activity_subdiv_last7` | POST | `/api/v1/monsoon-activity-subdiv-last7` | `{ "date": "TODAY" }` |
| `get_monsoon_activity_subdiv_last30` | POST | `/api/v1/monsoon-activity-subdiv-last30` | `{ "date": "TODAY" }` |
| `get_monsoon_activity_district_last7` | POST | `/api/v1/monsoon-activity-district-last7` | `{ "date": "TODAY" }` |
| `get_monsoon_activity_district_last30` | POST | `/api/v1/monsoon-activity-district-last30` | `{ "date": "TODAY" }` |

Filter one place with `post_filter.name` (or `subdiv_name` / `district_name`).  
List Active/Vigorous with:

```json
"post_process": {
  "type": "filter_by_monsoon_activity",
  "activities": ["Active", "Vigorous"]
}
```

| # | User intent | api_id | notes |
|---|-------------|--------|-------|
| 42 | Is monsoon Weak/Normal/Active/Vigorous/Subdued over [subdivision] today? | `get_monsoon_activity` | `post_filter.name` |
| 43 | Monsoon activity last 7 / 30 days | `get_monsoon_activity_subdiv_last7` / `_last30` | optional place filter |
| 44 | Monsoon activity at district level today | `get_monsoon_activity_district` | optional district filter |
| 45 | Which subdivisions are Active / Vigorous? | `get_monsoon_activity` | `filter_by_monsoon_activity` |

User: `Is monsoon Active over Kerala today?` →

```json
{
  "module": "monsoon",
  "api_id": "get_monsoon_activity",
  "method": "POST",
  "path": "/api/v1/monsoon-activity",
  "body": { "date": "TODAY" },
  "query": {},
  "post_filter": { "name": "Kerala" },
  "post_process": null,
  "reason": "Monsoon activity for Kerala subdivision today"
}
```

User: `Monsoon activity for last 7 days.` →

```json
{
  "module": "monsoon",
  "api_id": "get_monsoon_activity_subdiv_last7",
  "method": "POST",
  "path": "/api/v1/monsoon-activity-subdiv-last7",
  "body": { "date": "TODAY" },
  "query": {},
  "post_filter": {},
  "post_process": null,
  "reason": "Subdivision monsoon activity last 7 days"
}
```

User: `Monsoon activity at district level for today.` →

```json
{
  "module": "monsoon",
  "api_id": "get_monsoon_activity_district",
  "method": "POST",
  "path": "/api/v1/monsoon-activity-district",
  "body": { "date": "TODAY" },
  "query": {},
  "post_filter": {},
  "post_process": null,
  "reason": "District monsoon activity today"
}
```

User: `Which subdivisions are under active / vigorous monsoon?` →

```json
{
  "module": "monsoon",
  "api_id": "get_monsoon_activity",
  "method": "POST",
  "path": "/api/v1/monsoon-activity",
  "body": { "date": "TODAY" },
  "query": {},
  "post_filter": {},
  "post_process": {
    "type": "filter_by_monsoon_activity",
    "activities": ["Active", "Vigorous"]
  },
  "reason": "List Active/Vigorous subdivisions today"
}
```

---

# Module: Stations — Heavy Rainfall / max rainfall (ACTIVE)

Use the meteorological term **Heavy Rainfall** — never “Heaviest Rainfall”.

| api_id | method | path | body |
|--------|--------|------|------|
| `fetch_station_with_max_rainfall` | POST | `/api/v1/fetchStationWithMaxRainfall` | `{ startDate, endDate, limit }` |
| `fetch_station_data` | POST | `/api/v1/fetchStationData` | `{ Date }` or `{ startDate, endDate }` + `post_filter.station_name` |
| `top_rainfall_stations` | GET | `/api/v1/top-rainfall-stations` | query `days`, `topN` |

User: `Which stations recorded heavy rainfall last week?` →

```json
{
  "module": "rainfall",
  "api_id": "fetch_station_with_max_rainfall",
  "method": "POST",
  "path": "/api/v1/fetchStationWithMaxRainfall",
  "body": { "startDate": "LAST_7_START", "endDate": "TODAY", "limit": 10 },
  "query": {},
  "post_filter": {},
  "post_process": null,
  "reason": "Heavy Rainfall stations last 7 days"
}
```

User: `What is rainfall at Nungambakkam station today?` →

```json
{
  "module": "rainfall",
  "api_id": "fetch_station_data",
  "method": "POST",
  "path": "/api/v1/fetchStationData",
  "body": { "startDate": "TODAY", "endDate": "TODAY", "Date": "TODAY" },
  "query": {},
  "post_filter": { "station_name": "Nungambakkam" },
  "post_process": null,
  "reason": "Named station rainfall"
}
```

District questions return district actual/normal/departure **and** all stations in that district (backend enrichment).
---

# Module: Coverage & reporting (ACTIVE)

| api_id | method | path | body |
|--------|--------|------|------|
| `fetch_district_station_count` | POST | `/api/v1/fetchDistrictStationCount` | `{ startDate, endDate }` |
| `fetch_centre_station_summary` | POST | `/api/v1/fetchCentreStationSummary` | `{ startDate, endDate }` |

User: `Which MCs still have stations missing today?` → `fetch_centre_station_summary` with TODAY–TODAY.  
User: `How many stations reported per district today?` → `fetch_district_station_count`.

---

# Module: IMD + AWS combined (ACTIVE)

| api_id | method | path |
|--------|--------|------|
| `fetch_district_data_with_aws` | POST | `/api/v1/fetchDistrictDataWithAWS` |
| `fetch_state_data_with_aws` | POST | `/api/v1/fetchStateDataWithAWS` |
| `fetch_subdivision_data_with_aws` | POST | `/api/v1/fetchSubDivisionDataWithAWS` |
| `fetch_country_data_with_aws` | POST | `/api/v1/fetchCountryDataWithAWS` |
| `get_calculations_mode` | GET | `/api/v1/calculations-mode` |

User: `District rainfall including AWS for yesterday` → `fetch_district_data_with_aws` + YESTERDAY.  
User: `Are we publishing IMD-only or IMD+AWS?` → `get_calculations_mode`.

---

# Module: Range statistics (ACTIVE)

| api_id | method | path |
|--------|--------|------|
| `fetch_district_range_statistics` | POST | `/api/v1/fetchDistrictRangeStatistics` |
| `fetch_state_range_statistics` | POST | `/api/v1/fetchStateRangeStatistics` |
| `fetch_subdivision_range_statistics` | POST | `/api/v1/fetchSubdivisionRangeStatistics` |

Body `{ startDate, endDate }` — period min/max/avg/total.  
User: `Give me one-line state summary for the monsoon so far` → `fetch_state_range_statistics` with `SEASON_START`→`TODAY`.

Also: `get_latest_five_year_district` → `POST /getLatestFiveYearDataOfDistrict` with `{ startDate, endDate, district_code }` for multi-year comparison of one district.

> **Do not** use `/fetchTopNDistricts` for “top wettest districts nationwide” — that API needs a `district_code` and returns top days for **one** district. Use `fetch_district_data` + `rank_by_actual` instead.

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
| 19b | yearly statistics / yearly station statistics | Yearly Station Statistics | `/yearlystationstatistics` |
| 19c | all statistics | All Statistics | `/all-statistics` |
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

> Add later: station list, station daily data, verification details.

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
