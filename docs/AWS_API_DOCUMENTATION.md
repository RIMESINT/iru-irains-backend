# AWS API Documentation — Frontend Reference

> **Who is this for:** Frontend developers who need to know exactly what to send and exactly what they will receive back from every AWS API endpoint.
>
> **Base URL:** `POST /api/v1/{prefix}/{endpoint}`
>
> All dates: `YYYY-MM-DD` format. All fields marked `?` are optional — if not sent, default is today's date.

---

## Table of Contents

1. [Karnataka](#1-karnataka)
2. [Uttar Pradesh (UP)](#2-uttar-pradesh-up)
3. [Tamil Nadu](#3-tamil-nadu)
4. [Uttarakhand](#4-uttarakhand)
5. [Telangana](#5-telangana)
6. [Meghalaya](#6-meghalaya)
7. [Mizoram](#7-mizoram)
8. [NHP](#8-nhp-national-hydrology-project)
9. [IITM Mumbai](#9-iitm-mumbai-arg)
10. [Zomato AWS](#10-zomato-aws)
11. [Departure API Response Reference](#11-departure-api-response-reference)
12. [Quick URL Reference](#12-quick-url-reference)

---

## 1. Karnataka

**DB Table:** `observations_aws_karnataka`
**API Prefix:** `/api/v1/karnataka-aws`

### DB Table Columns

| Column | Type | Description |
|---|---|---|
| `id` | text | Station ID |
| `station` | text | Station name (may be NULL) |
| `type` | text | Station type |
| `state` | text | State name |
| `district` | text | District name (may be NULL) |
| `tehsil` | text | Tehsil name (may be NULL) |
| `block` | text | Block name (may be NULL) |
| `lat` | numeric | Latitude |
| `lon` | numeric | Longitude |
| `alt` | numeric | Altitude (m) |
| `dat` | date | Observation date |
| `time` | time | Observation time |
| `updated_at` | timestamp | Last updated |
| `rainfall` | numeric | Rainfall (mm) |
| `temp` | numeric | Temperature (°C) |
| `feel_like` | numeric | Feels-like temperature (°C) |
| `dewpoint` | numeric | Dew point (°C) |
| `rh` | numeric | Relative humidity (%) |
| `winds` | numeric | Wind speed (km/h) |
| `windd` | numeric | Wind direction (°) |
| `slp` | numeric | Sea-level pressure (hPa) |
| `mslp` | numeric | Mean sea-level pressure (hPa) |

---

### `POST /karnataka-aws/daily`

**Request Body**
```json
{ "startDate": "2025-06-01", "endDate": "2025-06-30", "district": "Bengaluru" }
```
> All fields optional. `district` filters to one district.

**Response Columns**

| Column | Type | Description |
|---|---|---|
| `dat` | date | Date |
| `district` | text | District name |
| `id` | text | Station ID |
| `station` | text | Station name |
| `type` | text | Station type |
| `lat` | numeric | Latitude |
| `lon` | numeric | Longitude |
| `total_rainfall` | numeric | Total rainfall for the day (mm) |
| `avg_temp` | numeric | Average temperature (°C) |
| `max_temp` | numeric | Maximum temperature (°C) |
| `min_temp` | numeric | Minimum temperature (°C) |
| `avg_feel_like` | numeric | Average feels-like temp (°C) |
| `avg_rh` | numeric | Average relative humidity (%) |
| `avg_wind_speed` | numeric | Average wind speed (km/h) |
| `readings_count` | integer | Number of 15-min slots recorded |
| `data_completeness_pct` | numeric | % of day's slots captured (max 96) |

---

### `POST /karnataka-aws/hourly`

**Request Body**
```json
{ "date": "2025-06-15", "hour": 14, "district": "Bengaluru" }
```
> `hour` is 0–23. If omitted, returns all hours.

**Response Columns**

| Column | Type | Description |
|---|---|---|
| `dat` | date | Date |
| `hour` | integer | Hour (0–23) |
| `district` | text | District name |
| `id` | text | Station ID |
| `station` | text | Station name |
| `type` | text | Station type |
| `total_rainfall` | numeric | Rainfall for that hour (mm) |
| `avg_temp` | numeric | Average temperature (°C) |
| `avg_rh` | numeric | Average relative humidity (%) |
| `readings_count` | integer | Number of 15-min slots in that hour |

---

### `POST /karnataka-aws/slot`

**Request Body**
```json
{ "date": "2025-06-15", "time": "14:30:00", "district": "Bengaluru" }
```
> Returns one raw 15-min reading per station for that exact timestamp.

**Response Columns**

| Column | Type | Description |
|---|---|---|
| `dat` | date | Date |
| `time` | time | Slot time |
| `state` | text | State |
| `district` | text | District |
| `tehsil` | text | Tehsil |
| `block` | text | Block |
| `id` | text | Station ID |
| `station` | text | Station name |
| `type` | text | Station type |
| `lat` | numeric | Latitude |
| `lon` | numeric | Longitude |
| `alt` | numeric | Altitude |
| `rainfall` | numeric | Rainfall this slot (mm) |
| `temp` | numeric | Temperature (°C) |
| `feel_like` | numeric | Feels-like temp (°C) |
| `dewpoint` | numeric | Dew point (°C) |
| `rh` | numeric | Relative humidity (%) |
| `winds` | numeric | Wind speed (km/h) |
| `windd` | numeric | Wind direction (°) |
| `slp` | numeric | Sea-level pressure (hPa) |
| `mslp` | numeric | Mean SLP (hPa) |
| `updated_at` | timestamp | Last updated |

---

### `POST /karnataka-aws/cumulative`

**Request Body**
```json
{ "startDate": "2025-06-01", "endDate": "2025-06-30", "district": "Bengaluru" }
```

**Response Columns**

| Column | Type | Description |
|---|---|---|
| `dat` | date | Date |
| `district` | text | District |
| `id` | text | Station ID |
| `station` | text | Station name |
| `daily_rainfall` | numeric | Rainfall on this specific day (mm) |
| `cumulative_rainfall` | numeric | Running total from startDate to this day (mm) |

---

### `POST /karnataka-aws/district-summary`

**Request Body**
```json
{ "date": "2025-06-15" }
```

**Response Columns**

| Column | Type | Description |
|---|---|---|
| `dat` | date | Date |
| `district` | text | District name |
| `total_stations` | integer | Number of distinct stations in district |
| `avg_rainfall` | numeric | Average rainfall across stations (mm) |
| `max_rainfall` | numeric | Highest station rainfall (mm) |
| `min_rainfall` | numeric | Lowest station rainfall (mm) |
| `sum_rainfall` | numeric | Total rainfall summed across stations (mm) |
| `avg_temp` | numeric | Average temperature (°C) |

---

### `POST /karnataka-aws/actual-departure`

**Request Body**
```json
{ "startDate": "2025-06-01", "endDate": "2025-06-30" }
```

**Response Columns** — one row per block

| Column | Type | Description |
|---|---|---|
| `block_name` | text | Block name (from AWS station data) |
| `block_code` | text | Block code (from IMD station registry) |
| `district_name` | text | District name |
| `district_code` | text | District code |
| `state_name` | text | State name |
| `state_code` | text | State code |
| `region_name` | text | Region (e.g. SOUTH INDIA) |
| `region_code` | text | Region code |
| `sub_division_code` | text | IMD sub-division code |
| `normal_rainfall` | numeric | Normal rainfall for date range (mm) |
| `actual_rainfall` | numeric | Actual observed rainfall (mm) |
| `departure` | numeric | Departure from normal (%) — NULL if no normal data |

---

### `POST /karnataka-aws/departure-analysis`

**Request Body**
```json
{ "startDate": "2025-06-01", "endDate": "2025-06-30" }
```

> See [Departure Analysis Response](#departure-analysis-response) section for full response structure.

---

### `POST /karnataka-aws/departure-export` *(Protected)*

**Request Body**
```json
{ "user": "CWC_DEP", "pass": "!Md@15O#cwc", "fromDate": "2025-06-01", "toDate": "2025-06-30" }
```

> Returns same columns as `/actual-departure`.

---

## 2. Uttar Pradesh (UP)

**DB Table:** `up_aws_observations`
**API Prefix:** `/api/v1/up-aws`

> **Important:** UP data is stored in UTC. The API automatically converts all dates and times to IST (+05:30) before returning.

### DB Table Columns

| Column | Type | Description |
|---|---|---|
| `id` | text | Station ID |
| `station` | text | Station name |
| `type` | text | Station type |
| `state` | text | State name |
| `district` | text | District name |
| `tehsil` | text | Tehsil name |
| `block` | text | Block name |
| `lat` | numeric | Latitude |
| `lon` | numeric | Longitude |
| `alt` | numeric | Altitude (m) |
| `dat` | date | Date (stored UTC) |
| `time` | time | Time (stored UTC) |
| `updated_at` | timestamp | Last updated |
| `rainfall` | numeric | Rainfall (mm) |
| `temp` | numeric | Temperature (°C) |
| `feel_like` | numeric | Feels-like temperature (°C) |
| `dewpoint` | numeric | Dew point (°C) |
| `rh` | numeric | Relative humidity (%) |
| `winds` | numeric | Wind speed (km/h) |
| `windd` | numeric | Wind direction (°) |
| `slp` | numeric | Sea-level pressure (hPa) |
| `mslp` | numeric | Mean sea-level pressure (hPa) |

---

### `POST /up-aws/daily`

**Request Body:** `{ "startDate"?, "endDate"?, "district"? }`

**Response Columns**

| Column | Type | Description |
|---|---|---|
| `dat` | date | IST date |
| `district` | text | District |
| `id` | text | Station ID |
| `station` | text | Station name |
| `type` | text | Station type |
| `lat` | numeric | Latitude |
| `lon` | numeric | Longitude |
| `total_rainfall` | numeric | Total rainfall for day (mm) |
| `avg_temp` | numeric | Average temperature (°C) |
| `max_temp` | numeric | Max temperature (°C) |
| `min_temp` | numeric | Min temperature (°C) |
| `avg_rh` | numeric | Average relative humidity (%) |
| `avg_wind_speed` | numeric | Average wind speed (km/h) |
| `readings_count` | integer | Slots recorded |
| `data_completeness_pct` | numeric | % of day captured |

---

### `POST /up-aws/hourly`

**Request Body:** `{ "date"?, "hour"?(0-23), "district"? }`

**Response Columns:** `dat`, `hour`, `district`, `id`, `station`, `type`, `total_rainfall`, `avg_temp`, `avg_rh`, `readings_count`

---

### `POST /up-aws/slot`

**Request Body:** `{ "date"?, "time"?(IST HH:mm:ss), "district"? }`

**Response Columns:** `dat`(IST), `time`(IST), `district`, `id`, `station`, `type`, `lat`, `lon`, `rainfall`, `temp`, `feel_like`, `rh`, `winds`, `windd`, `slp`, `mslp`, `updated_at`(IST)

---

### `POST /up-aws/cumulative`

**Request Body:** `{ "startDate"?, "endDate"?, "district"? }`

**Response Columns:** `dat`, `district`, `id`, `station`, `daily_rainfall`, `cumulative_rainfall`

---

### `POST /up-aws/district-summary`

**Request Body:** `{ "date"? }`

**Response Columns:** `dat`, `district`, `total_stations`, `avg_rainfall`, `max_rainfall`, `min_rainfall`, `sum_rainfall`, `avg_temp`

---

### `POST /up-aws/actual-departure`

**Request Body:** `{ "startDate"?, "endDate"? }`

**Response Columns:** `block_name`, `block_code`, `district_name`, `district_code`, `state_name`, `state_code`, `region_name`, `region_code`, `sub_division_code`, `normal_rainfall`, `actual_rainfall`, `departure`

---

### `POST /up-aws/departure-analysis` | `POST /up-aws/departure-export`

Same request/response as Karnataka equivalents. See [Departure Analysis Response](#departure-analysis-response).

---

## 3. Tamil Nadu

**DB Table:** `observations_aws_tamilnadu`
**API Prefix:** `/api/v1/tamilnadu-aws`

### DB Table Columns

| Column | Type | Description |
|---|---|---|
| `id` | text | Station ID |
| `station` | text | Station name |
| `type` | text | Station type |
| `state` | text | State |
| `district` | text | District |
| `tehsil` | text | Tehsil |
| `firka` | text | Firka (sub-tehsil unit — TN exclusive) |
| `block` | text | Block |
| `lat` | numeric | Latitude |
| `lon` | numeric | Longitude |
| `dat` | date | Date |
| `time` | time | Time |
| `updated_at` | timestamp | Last updated |
| `rainfall` | numeric | Rainfall (mm) |
| `temp` | numeric | Temperature (°C) |
| `feel_like` | numeric | Feels-like (°C) |
| `rh` | numeric | Relative humidity (%) |
| `winds` | numeric | Wind speed (km/h) |
| `windd` | numeric | Wind direction (°) |
| `slp` | numeric | Sea-level pressure (hPa) |
| `solar_radiation` | numeric | Solar radiation (W/m²) |
| `soil_temp` | numeric | Soil temperature (°C) |
| `soil_moist` | numeric | Soil moisture (%) |

---

### `POST /tamilnadu-aws/daily`

**Request Body:** `{ "startDate"?, "endDate"?, "district"?, "block"? }`

**Response Columns:** `dat`, `district`, `id`, `station`, `type`, `lat`, `lon`, `total_rainfall`, `avg_temp`, `max_temp`, `min_temp`, `avg_feel_like`, `avg_rh`, `avg_wind_speed`, `readings_count`, `data_completeness_pct`

---

### `POST /tamilnadu-aws/hourly`

**Request Body:** `{ "date"?, "hour"?(0-23), "district"?, "block"? }`

**Response Columns:** `dat`, `hour`, `district`, `id`, `station`, `type`, `total_rainfall`, `avg_temp`, `avg_rh`, `readings_count`

---

### `POST /tamilnadu-aws/slot`

**Request Body:** `{ "date"?, "time"?, "district"?, "block"? }`

**Response Columns:** `dat`, `time`, `state`, `district`, `tehsil`, `firka`, `block`, `id`, `station`, `type`, `lat`, `lon`, `rainfall`, `temp`, `feel_like`, `rh`, `winds`, `windd`, `slp`, `solar_radiation`, `soil_temp`, `soil_moist`, `updated_at`

---

### `POST /tamilnadu-aws/cumulative`

**Request Body:** `{ "startDate"?, "endDate"?, "district"?, "block"? }`

**Response Columns:** `dat`, `district`, `id`, `station`, `daily_rainfall`, `cumulative_rainfall`

---

### `POST /tamilnadu-aws/district-summary`

**Request Body:** `{ "date"? }`

**Response Columns:** `dat`, `district`, `total_stations`, `avg_rainfall`, `max_rainfall`, `min_rainfall`, `sum_rainfall`, `avg_temp`

---

### `POST /tamilnadu-aws/block-summary` *(Tamil Nadu Exclusive)*

**Request Body:** `{ "date"?, "district"? }`

**Response Columns:** `dat`, `district`, `block`, `total_stations`, `avg_rainfall`, `max_rainfall`, `min_rainfall`, `sum_rainfall`, `avg_temp`

---

### `POST /tamilnadu-aws/actual-departure` | `/departure-analysis` | `/departure-export`

Same as Karnataka. `/actual-departure` returns block-level columns. See [Departure Analysis Response](#departure-analysis-response).

---

## 4. Uttarakhand

**DB Table:** `observations_aws_uttarakhand`
**API Prefix:** `/api/v1/uttarakhand-aws`

> Some stations have NULL for `station`, `district`, `tehsil`, `block` — this is a source data limitation from IMD.

### DB Table Columns

| Column | Type | Description |
|---|---|---|
| `id` | text | Station ID |
| `station` | text | Station name (may be NULL) |
| `type` | text | Station type |
| `state` | text | State |
| `district` | text | District (may be NULL) |
| `tehsil` | text | Tehsil (may be NULL) |
| `block` | text | Block (may be NULL) |
| `lat` | numeric | Latitude |
| `lon` | numeric | Longitude |
| `alt` | numeric | Altitude (m) |
| `dat` | date | Date |
| `time` | time | Time |
| `updated_at` | timestamp | Last updated |
| `rainfall` | numeric | Rainfall (mm) |
| `temp` | numeric | Temperature (°C) |
| `feel_like` | numeric | Feels-like (°C) |
| `dewpoint` | numeric | Dew point (°C) |
| `rh` | numeric | Relative humidity (%) |
| `winds` | numeric | Wind speed (km/h) |
| `windd` | numeric | Wind direction (°) |
| `slp` | numeric | Sea-level pressure (hPa) |
| `mslp` | numeric | Mean sea-level pressure (hPa) |

---

### `POST /uttarakhand-aws/daily`

**Request Body:** `{ "startDate"?, "endDate"?, "district"? }`

**Response Columns:** `dat`, `district`, `id`, `station`, `type`, `lat`, `lon`, `total_rainfall`, `avg_temp`, `max_temp`, `min_temp`, `avg_feel_like`, `avg_rh`, `avg_wind_speed`, `readings_count`, `data_completeness_pct`

---

### `POST /uttarakhand-aws/hourly`

**Request Body:** `{ "date"?, "hour"?(0-23), "district"? }`

**Response Columns:** `dat`, `hour`, `district`, `id`, `station`, `type`, `total_rainfall`, `avg_temp`, `avg_rh`, `readings_count`

---

### `POST /uttarakhand-aws/slot`

**Request Body:** `{ "date"?, "time"?, "district"? }`

**Response Columns:** `dat`, `time`, `state`, `district`, `tehsil`, `block`, `id`, `station`, `type`, `lat`, `lon`, `alt`, `rainfall`, `temp`, `feel_like`, `dewpoint`, `rh`, `winds`, `windd`, `slp`, `mslp`, `updated_at`

---

### `POST /uttarakhand-aws/cumulative`

**Request Body:** `{ "startDate"?, "endDate"?, "district"? }`

**Response Columns:** `dat`, `district`, `id`, `station`, `daily_rainfall`, `cumulative_rainfall`

---

### `POST /uttarakhand-aws/district-summary`

**Request Body:** `{ "date"? }`

**Response Columns:** `dat`, `district`, `total_stations`, `avg_rainfall`, `max_rainfall`, `min_rainfall`, `sum_rainfall`, `avg_temp`

---

### `POST /uttarakhand-aws/actual-departure` | `/departure-analysis` | `/departure-export`

Same as Karnataka. Block-level departure. See [Departure Analysis Response](#departure-analysis-response).

---

## 5. Telangana

**DB Table:** `observations_aws_telangana`
**API Prefix:** `/api/v1/telangana-aws`

### DB Table Columns

Same columns as Uttarakhand (`id`, `station`, `type`, `state`, `district`, `tehsil`, `block`, `lat`, `lon`, `alt`, `dat`, `time`, `updated_at`, `rainfall`, `temp`, `feel_like`, `dewpoint`, `rh`, `winds`, `windd`, `slp`, `mslp`).

---

### `POST /telangana-aws/daily`

**Request Body:** `{ "startDate"?, "endDate"?, "district"? }`

**Response Columns:** `dat`, `district`, `id`, `station`, `type`, `lat`, `lon`, `total_rainfall`, `avg_temp`, `max_temp`, `min_temp`, `avg_feel_like`, `avg_rh`, `avg_wind_speed`, `readings_count`, `data_completeness_pct`

---

### `POST /telangana-aws/hourly`

**Request Body:** `{ "date"?, "hour"?(0-23), "district"? }`

**Response Columns:** `dat`, `hour`, `district`, `id`, `station`, `type`, `total_rainfall`, `avg_temp`, `avg_rh`, `readings_count`

---

### `POST /telangana-aws/slot`

**Request Body:** `{ "date"?, "time"?, "district"? }`

**Response Columns:** `dat`, `time`, `state`, `district`, `tehsil`, `block`, `id`, `station`, `type`, `lat`, `lon`, `alt`, `rainfall`, `temp`, `feel_like`, `dewpoint`, `rh`, `winds`, `windd`, `slp`, `mslp`, `updated_at`

---

### `POST /telangana-aws/cumulative`

**Request Body:** `{ "startDate"?, "endDate"?, "district"? }`

**Response Columns:** `dat`, `district`, `id`, `station`, `daily_rainfall`, `cumulative_rainfall`

---

### `POST /telangana-aws/district-summary`

**Request Body:** `{ "date"? }`

**Response Columns:** `dat`, `district`, `total_stations`, `avg_rainfall`, `max_rainfall`, `min_rainfall`, `sum_rainfall`, `avg_temp`

---

### `POST /telangana-aws/actual-departure` | `/departure-analysis` | `/departure-export`

Block-level departure. Same as Karnataka. See [Departure Analysis Response](#departure-analysis-response).

---

## 6. Meghalaya

**DB Table:** `observations_aws_meghalaya`
**API Prefix:** `/api/v1/meghalaya-aws`

> Meghalaya has extra environmental sensors (soil, irradiance, conductivity, battery) not present in other states.

### DB Table Columns

| Column | Type | Description |
|---|---|---|
| `id` | text | Station ID |
| `station` | text | Station name |
| `facility` | text | Facility name |
| `station_type` | text | Station type |
| `state` | text | State |
| `district` | text | District |
| `block` | text | Block |
| `alt` | numeric | Altitude (m) |
| `dat` | date | Date |
| `time` | time | Time |
| `updated_at` | timestamp | Last updated |
| `rainfall` | numeric | Rainfall — total (mm) |
| `rainfall_avg` | numeric | Rainfall — average (mm) |
| `temp` | numeric | Air temperature (°C) |
| `rh` | numeric | Relative humidity (%) |
| `slp` | numeric | Barometric pressure (hPa) |
| `winds` | numeric | Wind speed (km/h) |
| `windd` | numeric | Wind direction (°) |
| `soil_temp` | numeric | Soil temperature (°C) |
| `irradiance` | numeric | Global horizontal irradiance (W/m²) |
| `water_content` | numeric | Volumetric water content (%) |
| `conductivity` | numeric | Electrical conductivity (dS/m) |
| `battery` | numeric | Battery voltage (V) |
| `panel_temp` | numeric | Panel temperature (°C) |

---

### `POST /meghalaya-aws/daily`

**Request Body:** `{ "startDate"?, "endDate"?, "district"? }`

**Response Columns:** `dat`, `district`, `id`, `station`, `station_type`, `total_rainfall`, `avg_temp`, `avg_rh`, `avg_wind_speed`, `readings_count`, `data_completeness_pct`

---

### `POST /meghalaya-aws/hourly`

**Request Body:** `{ "date"?, "hour"?(0-23), "district"? }`

**Response Columns:** `dat`, `hour`, `district`, `id`, `station`, `total_rainfall`, `avg_temp`, `avg_rh`, `readings_count`

---

### `POST /meghalaya-aws/slot`

**Request Body:** `{ "date"?, "time"?, "district"? }`

**Response Columns:** `dat`, `time`, `state`, `district`, `block`, `id`, `station`, `facility`, `station_type`, `alt`, `rainfall`, `rainfall_avg`, `temp`, `rh`, `slp`, `winds`, `windd`, `soil_temp`, `irradiance`, `water_content`, `conductivity`, `battery`, `panel_temp`, `updated_at`

---

### `POST /meghalaya-aws/cumulative`

**Request Body:** `{ "startDate"?, "endDate"?, "district"? }`

**Response Columns:** `dat`, `district`, `id`, `station`, `daily_rainfall`, `cumulative_rainfall`

---

### `POST /meghalaya-aws/district-summary`

**Request Body:** `{ "date"? }`

**Response Columns:** `dat`, `district`, `total_stations`, `avg_rainfall`, `max_rainfall`, `min_rainfall`, `sum_rainfall`, `avg_temp`

---

### `POST /meghalaya-aws/actual-departure` | `/departure-analysis` | `/departure-export`

Block-level departure. Same as Karnataka. See [Departure Analysis Response](#departure-analysis-response).

---

## 7. Mizoram

**DB Table:** `observations_aws_mizoram`
**API Prefix:** `/api/v1/mizoram-aws`

> Mizoram has **no block column**. Departure is computed at district level.

### DB Table Columns

| Column | Type | Description |
|---|---|---|
| `id` | text | Station ID |
| `station` | text | Station name |
| `station_type` | text | Station type |
| `state` | text | State |
| `district` | text | District |
| `dat` | date | Date |
| `time` | time | Time |
| `updated_at` | timestamp | Last updated |
| `rainfall` | numeric | Daily rainfall (mm) |
| `rainfall_hourly` | numeric | Hourly rainfall (mm) |
| `temp` | numeric | Temperature (°C) |
| `rh` | numeric | Relative humidity (%) |
| `slp` | numeric | Atmospheric pressure (hPa) |
| `winds` | numeric | Wind speed (km/h) |
| `windd` | numeric | Wind direction (°) |
| `soil_moisture` | numeric | Soil moisture (%) |
| `soil_temp` | numeric | Soil temperature (°C) |
| `solar_radiation` | numeric | Solar radiation (W/m²) |

---

### `POST /mizoram-aws/daily`

**Request Body:** `{ "startDate"?, "endDate"?, "district"? }`

**Response Columns:** `dat`, `district`, `id`, `station`, `station_type`, `total_rainfall`, `avg_temp`, `avg_rh`, `readings_count`, `data_completeness_pct`

---

### `POST /mizoram-aws/hourly`

**Request Body:** `{ "date"?, "hour"?(0-23), "district"? }`

**Response Columns:** `dat`, `hour`, `district`, `id`, `station`, `total_rainfall`, `avg_temp`, `avg_rh`, `readings_count`

---

### `POST /mizoram-aws/slot`

**Request Body:** `{ "date"?, "time"?, "district"? }`

**Response Columns:** `dat`, `time`, `state`, `district`, `id`, `station`, `station_type`, `rainfall`, `rainfall_hourly`, `temp`, `rh`, `slp`, `winds`, `windd`, `soil_moisture`, `soil_temp`, `solar_radiation`, `updated_at`

---

### `POST /mizoram-aws/cumulative`

**Request Body:** `{ "startDate"?, "endDate"?, "district"? }`

**Response Columns:** `dat`, `district`, `id`, `station`, `daily_rainfall`, `cumulative_rainfall`

---

### `POST /mizoram-aws/district-summary`

**Request Body:** `{ "date"? }`

**Response Columns:** `dat`, `district`, `total_stations`, `avg_rainfall`, `max_rainfall`, `min_rainfall`, `sum_rainfall`, `avg_temp`

---

### `POST /mizoram-aws/actual-departure`

**Request Body:** `{ "startDate"?, "endDate"? }`

**Response Columns** — one row per district

| Column | Type | Description |
|---|---|---|
| `district_name` | text | District name |
| `district_code` | text | District code |
| `state_name` | text | State name |
| `state_code` | text | State code |
| `region_name` | text | Region |
| `region_code` | text | Region code |
| `sub_division_code` | text | IMD sub-division code |
| `normal_rainfall` | numeric | Normal rainfall (mm) |
| `actual_rainfall` | numeric | Actual rainfall (mm) |
| `departure` | numeric | Departure % (NULL if no normal) |

---

### `POST /mizoram-aws/departure-analysis` | `/departure-export`

See [Departure Analysis Response](#departure-analysis-response).

---

## 8. NHP (National Hydrology Project)

**DB Table:** `observations_aws_nhp`
**API Prefix:** `/api/v1/nhp-aws`

> NHP has **no block column**. Has two rainfall columns: `rainfall` (telemetry) and `rainfall_daily` (accumulated). Departure uses `rainfall`.

### DB Table Columns

| Column | Type | Description |
|---|---|---|
| `id` | text | Station ID |
| `station` | text | Station name |
| `district` | text | District |
| `state` | text | State |
| `dat` | date | Date |
| `time` | time | Time |
| `updated_at` | timestamp | Last updated |
| `temp` | numeric | Temperature (°C) |
| `feel_like` | numeric | Feels-like (°C) |
| `rh` | numeric | Relative humidity (%) |
| `slp` | numeric | Pressure (hPa) |
| `winds` | numeric | Wind speed (km/h) |
| `windd` | numeric | Wind direction (°) |
| `rainfall_daily` | numeric | Daily accumulated rainfall — INSAT (mm) |
| `rainfall` | numeric | Telemetry rainfall (mm) |

---

### `POST /nhp-aws/daily`

**Request Body:** `{ "startDate"?, "endDate"?, "district"? }`

**Response Columns:** `dat`, `district`, `id`, `station`, `total_rainfall`, `avg_temp`, `avg_rh`, `avg_wind_speed`, `readings_count`, `data_completeness_pct`

---

### `POST /nhp-aws/hourly`

**Request Body:** `{ "date"?, "hour"?(0-23), "district"? }`

**Response Columns:** `dat`, `hour`, `district`, `id`, `station`, `total_rainfall`, `avg_temp`, `avg_rh`, `readings_count`

---

### `POST /nhp-aws/slot`

**Request Body:** `{ "date"?, "time"?, "district"? }`

**Response Columns:** `dat`, `time`, `state`, `district`, `id`, `station`, `temp`, `feel_like`, `rh`, `slp`, `winds`, `windd`, `rainfall_daily`, `rainfall`, `updated_at`

---

### `POST /nhp-aws/cumulative`

**Request Body:** `{ "startDate"?, "endDate"?, "district"? }`

**Response Columns:** `dat`, `district`, `id`, `station`, `daily_rainfall`, `cumulative_rainfall`

---

### `POST /nhp-aws/district-summary`

**Request Body:** `{ "date"? }`

**Response Columns:** `dat`, `district`, `total_stations`, `avg_rainfall`, `max_rainfall`, `min_rainfall`, `sum_rainfall`, `avg_temp`

---

### `POST /nhp-aws/actual-departure` | `/departure-analysis` | `/departure-export`

District-level departure (same columns as Mizoram departure). See [Departure Analysis Response](#departure-analysis-response).

---

## 9. IITM Mumbai (ARG)

**DB Table:** `observations_iitm_mumbai`
**API Prefix:** `/api/v1/iitm-mumbai`

> IITM Mumbai is a **rainfall-only** Automatic Rain Gauge network. No temperature, humidity, or wind data. No block column. Departure is at district level.

### DB Table Columns

| Column | Type | Description |
|---|---|---|
| `id` | text | Station ID |
| `station` | text | Station name |
| `type` | text | Station type |
| `state` | text | State |
| `district` | text | District |
| `lat` | numeric | Latitude |
| `lon` | numeric | Longitude |
| `dat` | date | Date |
| `time` | time | Time |
| `updated_at` | timestamp | Last updated |
| `rainfall` | numeric | Rainfall (mm) |

---

### `POST /iitm-mumbai/daily`

**Request Body:** `{ "startDate"?, "endDate"?, "district"? }`

**Response Columns:** `dat`, `district`, `id`, `station`, `type`, `lat`, `lon`, `total_rainfall`, `readings_count`, `data_completeness_pct`

---

### `POST /iitm-mumbai/hourly`

**Request Body:** `{ "date"?, "hour"?(0-23), "district"? }`

**Response Columns:** `dat`, `hour`, `district`, `id`, `station`, `type`, `total_rainfall`, `readings_count`

---

### `POST /iitm-mumbai/slot`

**Request Body:** `{ "date"?, "time"?, "district"? }`

**Response Columns:** `dat`, `time`, `state`, `district`, `id`, `station`, `type`, `lat`, `lon`, `rainfall`, `updated_at`

---

### `POST /iitm-mumbai/cumulative`

**Request Body:** `{ "startDate"?, "endDate"?, "district"? }`

**Response Columns:** `dat`, `district`, `id`, `station`, `daily_rainfall`, `cumulative_rainfall`

---

### `POST /iitm-mumbai/district-summary`

**Request Body:** `{ "date"? }`

**Response Columns:** `dat`, `district`, `total_stations`, `avg_rainfall`, `max_rainfall`, `min_rainfall`, `sum_rainfall`

---

### `POST /iitm-mumbai/actual-departure` | `/departure-analysis` | `/departure-export`

District-level departure (same columns as Mizoram departure). See [Departure Analysis Response](#departure-analysis-response).

---

## 10. Zomato AWS

**DB Table:** `observations_aws_zomato`
**API Prefix:** `/api/v1/zomato-aws`

> Zomato uses `city` instead of `district`. No block column. Departure is matched by city name against district normals.

### DB Table Columns

| Column | Type | Description |
|---|---|---|
| `id` | text | Station ID |
| `station` | text | Station name |
| `city` | text | City name |
| `type` | text | Station type |
| `lat` | numeric | Latitude |
| `lon` | numeric | Longitude |
| `dat` | date | Date |
| `time` | time | Time |
| `temp` | numeric | Temperature (°C) |
| `feel_like` | numeric | Feels-like (°C) |
| `rh` | numeric | Relative humidity (%) |
| `winds` | numeric | Wind speed (km/h) |
| `windd` | numeric | Wind direction (°) |
| `rainfall` | numeric | Rainfall (mm) |

---

### `POST /zomato-aws/daily`

**Request Body:** `{ "startDate"?, "endDate"?, "city"? }`

**Response Columns:** `dat`, `city`, `id`, `station`, `type`, `lat`, `lon`, `total_rainfall`, `avg_temp`, `avg_rh`, `avg_wind_speed`, `readings_count`, `data_completeness_pct`

---

### `POST /zomato-aws/hourly`

**Request Body:** `{ "date"?, "hour"?(0-23), "city"? }`

**Response Columns:** `dat`, `hour`, `city`, `id`, `station`, `type`, `total_rainfall`, `avg_temp`, `avg_rh`, `readings_count`

---

### `POST /zomato-aws/slot`

**Request Body:** `{ "date"?, "time"?, "city"? }`

**Response Columns:** `dat`, `time`, `city`, `id`, `station`, `type`, `lat`, `lon`, `rainfall`, `temp`, `feel_like`, `rh`, `winds`, `windd`

---

### `POST /zomato-aws/cumulative`

**Request Body:** `{ "startDate"?, "endDate"?, "city"? }`

**Response Columns:** `dat`, `city`, `id`, `station`, `daily_rainfall`, `cumulative_rainfall`

---

### `POST /zomato-aws/city-summary`

**Request Body:** `{ "date"? }`

**Response Columns:** `dat`, `city`, `total_stations`, `avg_rainfall`, `max_rainfall`, `min_rainfall`, `sum_rainfall`, `avg_temp`

---

### `POST /zomato-aws/actual-departure`

**Request Body:** `{ "startDate"?, "endDate"? }`

**Response Columns** — `district_name` here = city name

| Column | Type | Description |
|---|---|---|
| `district_name` | text | City name |
| `district_code` | text | Matched district code (may be NULL if city name doesn't match) |
| `state_name` | text | State |
| `state_code` | text | State code |
| `region_name` | text | Region |
| `region_code` | text | Region code |
| `sub_division_code` | text | IMD sub-division code |
| `normal_rainfall` | numeric | Normal (mm) — may be NULL |
| `actual_rainfall` | numeric | Actual (mm) |
| `departure` | numeric | Departure % — NULL if no normal match |

---

### `POST /zomato-aws/departure-analysis` | `/departure-export`

See [Departure Analysis Response](#departure-analysis-response).

---

## 11. Departure API Response Reference

### Departure Formula
```
departure (%) = ((actual_rainfall - normal_rainfall) / normal_rainfall) × 100
```
- Positive = more rain than normal (excess)
- Negative = less rain than normal (deficient)
- NULL = no normal data available for that block/district

---

### Departure Analysis Response

`POST /{state}/departure-analysis` returns this structure:

```json
{
  "success": true,
  "message": "...",
  "data": {

    "categoryCounts": {
      "Large Excess": 12,
      "Excess": 34,
      "Normal": 89,
      "Deficient": 45,
      "Large Deficient": 10,
      "No Rain": 5,
      "No Data": 20
    },

    "topActual": { ...full block/district row with highest actual_rainfall },
    "minActual": { ...full block/district row with lowest actual_rainfall },
    "topDeparture": { ...full row with highest departure % },
    "minDeparture": { ...full row with lowest (most deficient) departure % },

    "regionalStatistics": [
      { "region": "SOUTH INDIA", "avgRainfall": 25.5, "change": 12.3 },
      { "region": "NORTH INDIA", "avgRainfall": 8.1, "change": -35.0 }
    ],

    "stateStatistics": [
      { "state": "Karnataka", "avgRainfall": 18.4, "change": 5.2 }
    ],

    "subdivisionStatistics": [
      { "subdivision": "Subdivision 16", "avgRainfall": 22.1, "change": 18.5 }
    ],

    "summaryStatistics": {
      "totalRainfall": 1543.2,
      "highestRainfall": "25.5 mm (SOUTH INDIA)",
      "lowestRainfall": "8.1 mm (NORTH INDIA)",
      "averageDeparture": -4.7
    }

  }
}
```

**Category thresholds:**

| Category | Departure Range |
|---|---|
| Large Excess | ≥ +60% |
| Excess | +20% to +59% |
| Normal | -19% to +19% |
| Deficient | -20% to -59% |
| Large Deficient | -60% to -99% |
| No Rain | exactly -100% |
| No Data | departure is NULL |

---

### Departure Export (Protected)

`POST /{state}/departure-export`

```json
{ "user": "CWC_DEP", "pass": "!Md@15O#cwc", "fromDate": "2025-06-01", "toDate": "2025-06-30" }
```

Returns same array as `/actual-departure`. Returns `401` if credentials are wrong.

---

## 12. Quick URL Reference

### All 80 Endpoints

| State | `/daily` | `/hourly` | `/slot` | `/cumulative` | `/district-summary` | `/actual-departure` | `/departure-analysis` | `/departure-export` |
|---|---|---|---|---|---|---|---|---|
| Karnataka | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| UP | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Tamil Nadu | ✅ | ✅ | ✅ | ✅ | ✅ + `/block-summary` | ✅ | ✅ | ✅ |
| Uttarakhand | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Telangana | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Meghalaya | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Mizoram | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| NHP | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| IITM Mumbai | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Zomato | ✅ | ✅ | ✅ | ✅ | `/city-summary` | ✅ | ✅ | ✅ |

### Departure Grouping Level

| State | Departure grouped by |
|---|---|
| Karnataka, UP, Tamil Nadu, Uttarakhand, Telangana, Meghalaya | **Block** (`block_name`, `block_code`) |
| Mizoram, NHP, IITM Mumbai, Zomato | **District / City** (`district_name`, `district_code`) |

---

*Source: `controllers/scripts/aws/` — all 10 state controllers + `awsRoutes.js`. Last updated: 2026-05-05.*
