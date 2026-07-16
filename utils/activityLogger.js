const client = require("../connection");
const moment = require("moment-timezone");
const { broadcastActivityLogged } = require("./adminRealtime");

const IST = "Asia/Kolkata";

// ── Page configs ──────────────────────────────────────────────
const PAGES = {
    calcMode: {
        module_name: "Data Management",
        category_name: "Calculation",
        page_name: "Calculation Mode",
        route_path: "/data-management/calculation-mode",
    },
    calcExclusion: {
        module_name: "Data Management",
        category_name: "Calculation",
        page_name: "Calculation Exclusion",
        route_path: "/data-management/calculation-exclusion",
    },
    displayOrder: {
        module_name: "Data Management",
        category_name: "Display Order",
        page_name: "Display Order",
        route_path: "/data-management/display-order",
    },
    reviewPublish: {
        module_name: "Data Management",
        category_name: "Station Data",
        page_name: "Review & Publish",
        route_path: "/data-management/review-and-publish",
    },
    spatialGeojson: {
        module_name: "Spatial Boundaries",
        category_name: "GeoJSON",
        page_name: "GeoJSON",
        route_path: "/spatial-boundaries/geojson",
    },
    spatialRegion: {
        module_name: "Spatial Boundaries",
        category_name: "Region",
        page_name: "Region",
        route_path: "/spatial-boundaries/region",
    },
    spatialState: {
        module_name: "Spatial Boundaries",
        category_name: "State",
        page_name: "State",
        route_path: "/spatial-boundaries/state",
    },
    spatialSubdivision: {
        module_name: "Spatial Boundaries",
        category_name: "Subdivision",
        page_name: "Subdivision",
        route_path: "/spatial-boundaries/subdivision",
    },
    spatialDistrict: {
        module_name: "Spatial Boundaries",
        category_name: "District",
        page_name: "District",
        route_path: "/spatial-boundaries/district",
    },
    spatialBlock: {
        module_name: "Spatial Boundaries",
        category_name: "Block",
        page_name: "Block",
        route_path: "/spatial-boundaries/block",
    },
    normalsCountry: {
        module_name: "Data Management",
        category_name: "Normals",
        page_name: "Country",
        route_path: "/data-management/normals/country",
    },
    normalsRegion: {
        module_name: "Data Management",
        category_name: "Normals",
        page_name: "Region",
        route_path: "/data-management/normals/region",
    },
    normalsState: {
        module_name: "Data Management",
        category_name: "Normals",
        page_name: "State",
        route_path: "/data-management/normals/state",
    },
    normalsSubdivision: {
        module_name: "Data Management",
        category_name: "Normals",
        page_name: "Subdivision",
        route_path: "/data-management/normals/subdivision",
    },
    normalsDistrict: {
        module_name: "Data Management",
        category_name: "Normals",
        page_name: "District",
        route_path: "/data-management/normals/district",
    },
    normalsBlock: {
        module_name: "Data Management",
        category_name: "Normals",
        page_name: "Block",
        route_path: "/data-management/normals/block",
    },
};

const SPATIAL_BOUNDARY_PAGE_KEYS = [
    "spatialGeojson",
    "spatialRegion",
    "spatialState",
    "spatialSubdivision",
    "spatialDistrict",
    "spatialBlock",
];

const NORMALS_PAGE_KEYS = [
    "normalsCountry",
    "normalsRegion",
    "normalsState",
    "normalsSubdivision",
    "normalsDistrict",
    "normalsBlock",
];

const SPATIAL_PAGE_ENTITY_TYPE = {
    spatialGeojson: "geojson",
    spatialRegion: "region",
    spatialState: "state",
    spatialSubdivision: "subdivision",
    spatialDistrict: "district",
    spatialBlock: "block",
};

const NORMALS_PAGE_ENTITY_TYPE = {
    normalsCountry: "country",
    normalsRegion: "region",
    normalsState: "state",
    normalsSubdivision: "subdivision",
    normalsDistrict: "district",
    normalsBlock: "block",
};

const GEO_ADMIN_PAGE_ENTITY_TYPE = {
    ...SPATIAL_PAGE_ENTITY_TYPE,
    ...NORMALS_PAGE_ENTITY_TYPE,
};

const SPATIAL_BOUNDARY_ACTIONS = [
    "PAGE_ACCESS",
    "UPLOAD",
    "REPLACE_NORMALS",
    "ADD_YEAR_NORMALS",
    "BULK_REPLACE_NORMALS",
    "BULK_ADD_YEAR_NORMALS",
    "ADD_DISTRICT",
    "UPDATE_NORMALS",
    "DOWNLOAD_TEMPLATE",
    "UPDATE",
];

const NORMALS_ACTIONS = [
    "PAGE_ACCESS",
    "REPLACE_NORMALS",
    "ADD_YEAR_NORMALS",
    "BULK_REPLACE_NORMALS",
    "BULK_ADD_YEAR_NORMALS",
    "ADD_DISTRICT",
    "UPDATE_NORMALS",
    "DOWNLOAD_TEMPLATE",
    "UPDATE",
];

const DISPLAY_ORDER_ENTITY_TYPE = {
    district: "district",
    state: "state",
    subdivision: "subdivision",
};

const REVIEW_PUBLISH_ACTIONS = [
    "PAGE_ACCESS",
    "VERIFY",
    "BULK_VERIFY",
    "UPDATE",
    "PUBLISH",
    "UPLOAD",
];

const EXCLUSION_ENTITY_TYPE_SHORT = {
    district: "dist",
    station: "stn",
    block: "block",
    state: "state",
    subdivision: "subdiv",
    region: "region",
};

// ── Core helpers ──────────────────────────────────────────────
const parsePhoneNumber = (value) => {
    if (value == null || value === "") return null;
    const digits = String(value).replace(/\D/g, "");
    if (!digits) return null;
    const num = Number(digits);
    return Number.isSafeInteger(num) ? num : null;
};

const getActionDateTime = () => {
    const now = moment().tz(IST);
    return {
        action_date: now.format("YYYY-MM-DD"),
        action_time: now.format("HH:mm:ss"),
    };
};

const extractUserFromRequest = (req) => {
    const body = req?.body || {};
    return {
        login_id: body.login_id ?? body.user_id ?? null,
        emp_name: body.emp_name ?? body.name ?? null,
        emp_designation: body.emp_designation ?? body.designation ?? null,
        emp_phone_number: parsePhoneNumber(
            body.emp_phone_number ?? body.phone_number ?? body.phone
        ),
        emp_email: body.emp_email ?? body.email ?? body.username ?? null,
        mcorhq_type: body.mcorhq_type ?? null,
        remark: body.remark?.trim() || null,
    };
};

const validateOfficerFields = (body) => {
    const emp_name = body?.emp_name?.trim() || body?.name?.trim();
    const emp_designation = body?.emp_designation?.trim() || body?.designation?.trim();
    const emp_phone_number = body?.emp_phone_number ?? body?.phone_number ?? body?.phone;

    if (!emp_name) return "emp_name is required";
    if (!emp_designation) return "emp_designation is required";
    if (emp_phone_number == null || emp_phone_number === "") return "emp_phone_number is required";
    return null;
};

const calcModeLabel = (useAws) => (useAws === 1 ? "IMD + AWS" : "IMD Only");

const shortExclusionEntityType = (entity_type) =>
    EXCLUSION_ENTITY_TYPE_SHORT[entity_type?.toLowerCase()] || entity_type;

const formatEntityLabel = (entity_type, entity_code, entity_name) =>
    entity_name ? `${entity_name} (${entity_code})` : `${entity_type} ${entity_code}`;

const formatDateRange = (from_date, to_date) =>
    from_date === to_date ? from_date : `${from_date} to ${to_date}`;

const toLogText = (value) => (value != null ? String(value) : null);

const GEO_ENTITY_CODE_FIELDS = [
    "entity_code",
    "country_code",
    "district_code",
    "state_code",
    "region_code",
    "subdiv_code",
    "block_code",
];

const hasGeoEntityCode = (body) =>
    GEO_ENTITY_CODE_FIELDS.some((field) => body[field] != null);

const ENTITY_CODE_REQUIRED_ACTIONS = [
    "REPLACE_NORMALS",
    "ADD_YEAR_NORMALS",
    "UPDATE_NORMALS",
    "DOWNLOAD_TEMPLATE",
    "ADD_DISTRICT",
];

const BULK_NORMALS_ACTIONS = ["BULK_REPLACE_NORMALS", "BULK_ADD_YEAR_NORMALS"];

const validateGeoAdminPayload = (body, action_type, allowedActions, options = {}) => {
    if (!allowedActions.includes(action_type)) {
        return `action_type must be one of: ${allowedActions.join(", ")}`;
    }
    if (action_type === "UPLOAD") {
        if (!body.folder) return "folder is required for UPLOAD";
        if (!body.file_name && !body.fileName) return "file_name is required for UPLOAD";
    }
    if (ENTITY_CODE_REQUIRED_ACTIONS.includes(action_type) && !hasGeoEntityCode(body)) {
        return "entity_code (or country_code / district_code / state_code / region_code / subdiv_code / block_code) is required";
    }
    if (
        options.requireDistrictForAddDistrict &&
        action_type === "ADD_DISTRICT" &&
        !body.district_code &&
        body.entity_code == null
    ) {
        return "district_code is required for ADD_DISTRICT";
    }
    if (BULK_NORMALS_ACTIONS.includes(action_type) && body.entity_count == null && !body.entity_data) {
        return "entity_count or entity_data is required for bulk normals actions";
    }
    return null;
};

const formatExclusionState = (state, entity_type, entity_code, entity_name, from_date, to_date) =>
    `${state}: ${formatEntityLabel(entity_type, entity_code, entity_name)} [${formatDateRange(from_date, to_date)}]`;

const formatDisplayOrderSummary = (entityType, row) => {
    if (entityType === DISPLAY_ORDER_ENTITY_TYPE.district) {
        const name = row.district_name || row.district_code;
        return `${name} (${row.district_code}) | ${row.state_name || ""} | order: ${row.display_order}`;
    }
    if (entityType === DISPLAY_ORDER_ENTITY_TYPE.state) {
        const name = row.state_name || row.state_code;
        return `${name} (${row.state_code}) | ${row.region_name || ""} | order: ${row.display_order}`;
    }
    const name = row.subdivision_name || row.subdiv_code;
    return `${name} (${row.subdiv_code}) | ${row.region_name || ""} | order: ${row.display_order}`;
};

const displayOrderEntityName = (entityType, row) => {
    if (entityType === DISPLAY_ORDER_ENTITY_TYPE.district) return row.district_name || String(row.district_code);
    if (entityType === DISPLAY_ORDER_ENTITY_TYPE.state) return row.state_name || String(row.state_code);
    return row.subdivision_name || String(row.subdiv_code);
};

/**
 * Insert a row into admin_activity_logs.
 * `user.emp_name` is required; falls back to 'Unknown' if missing.
 * `status`: 'updated' | 'not'
 */
const logActivity = async ({
    req,
    user = {},
    page,
    action_type,
    changed_field = null,
    old_value = null,
    new_value = null,
    entity_type = null,
    entity_name = null,
    entity_data = null,
    remark = null,
    status = "updated",
    skip_broadcast = false,
}) => {
    const fromBody = req ? extractUserFromRequest(req) : {};
    const mergedUser = { ...fromBody, ...user };

    const empName = mergedUser.emp_name || "Unknown";
    const logRemark = remark ?? mergedUser.remark ?? null;
    const { action_date, action_time } = getActionDateTime();

    const result = await client.query(
        `INSERT INTO public.admin_activity_logs (
            login_id, emp_name, emp_designation, emp_phone_number, emp_email, mcorhq_type,
            module_name, category_name, page_name, route_path,
            action_type, changed_field, old_value, new_value,
            entity_type, entity_name, entity_data, remark, status,
            action_date, action_time, created_at
        ) VALUES (
            $1, $2, $3, $4, $5, $6,
            $7, $8, $9, $10,
            $11, $12, $13, $14,
            $15, $16, $17, $18, $19,
            $20, $21, NOW()
        )
        RETURNING
            id, login_id, emp_name, emp_designation, emp_phone_number, emp_email, mcorhq_type,
            module_name, category_name, page_name, route_path,
            action_type, changed_field, old_value, new_value,
            entity_type, entity_name, entity_data, remark, status,
            action_date, action_time`,
        [
            mergedUser.login_id ?? null,
            empName,
            mergedUser.emp_designation ?? null,
            mergedUser.emp_phone_number ?? null,
            mergedUser.emp_email ?? null,
            mergedUser.mcorhq_type ?? null,
            page.module_name,
            page.category_name ?? null,
            page.page_name,
            page.route_path,
            action_type,
            changed_field,
            toLogText(old_value),
            toLogText(new_value),
            entity_type,
            entity_name,
            toLogText(entity_data),
            logRemark,
            status,
            action_date,
            action_time,
        ]
    );

    const row = result.rows[0];
    if (!skip_broadcast && row) {
        broadcastActivityLogged(page.route_path, row);
    }
    return row;
};

const safeLogActivity = async (tag, payload) => {
    try {
        await logActivity(payload);
    } catch (err) {
        console.error(`[${tag}] activity log failed:`, err.message);
    }
};

// ── Calculation Mode ──────────────────────────────────────────
const logCalcModePageAccess = async (req, currentMode) =>
    safeLogActivity("CALC MODE", {
        req,
        page: PAGES.calcMode,
        action_type: "PAGE_ACCESS",
        entity_type: "mode",
        entity_name: "Calculation Mode",
        entity_data: `Page accessed | current mode: ${currentMode}`,
        changed_field: "page_access",
        old_value: null,
        new_value: currentMode,
        status: "updated",
    });

const logCalcModeToggle = async (req, useAwsBefore, useAws) =>
    safeLogActivity("CALC MODE", {
        req,
        page: PAGES.calcMode,
        action_type: "TOGGLE",
        changed_field: "calculation_mode",
        old_value: calcModeLabel(useAwsBefore),
        new_value: calcModeLabel(useAws),
        entity_type: "mode",
        entity_name: "Calculation Mode",
        entity_data: `${calcModeLabel(useAwsBefore)} → ${calcModeLabel(useAws)}`,
        remark: req.body?.remark?.trim() || null,
        status: "updated",
    });

// ── Calculation Exclusion ─────────────────────────────────────
const buildExclusionLog = ({
    req,
    remark,
    entity_type,
    entity_name,
    entity_code,
    from_date,
    to_date,
    action_type,
    oldState,
    newState,
    isUpdated,
}) => ({
    req,
    page: PAGES.calcExclusion,
    action_type,
    entity_type: shortExclusionEntityType(entity_type),
    entity_name: entity_name || null,
    entity_data: `exclusion ${oldState} → ${newState} | code: ${entity_code} | ${formatDateRange(from_date, to_date)}`,
    remark,
    status: isUpdated ? "updated" : "not",
    changed_field: `${entity_type}_exclusion`,
    old_value: formatExclusionState(oldState, entity_type, entity_code, entity_name, from_date, to_date),
    new_value: formatExclusionState(newState, entity_type, entity_code, entity_name, from_date, to_date),
});

const logExclusionActivity = async (payload) =>
    safeLogActivity("CALC EXCLUSION", payload);

const buildBulkExclusionLog = ({
    req,
    remark,
    action,
    entities,
    entityType,
    allSameType,
    affected,
    from_date,
    to_date,
}) => {
    const bulkNames = entities
        .map((e) => e.entity_name || e.entity_code)
        .slice(0, 5)
        .join(", ");
    const dateRange = formatDateRange(from_date, to_date);

    return {
        req,
        page: PAGES.calcExclusion,
        action_type: action === "exclude" ? "BULK_EXCLUDE" : "BULK_INCLUDE",
        entity_type: allSameType ? shortExclusionEntityType(entityType) : "bulk",
        entity_name: allSameType
            ? (entities.length === 1 ? (entities[0].entity_name || null) : `${entities.length} ${shortExclusionEntityType(entityType)}`)
            : `${entities.length} mixed`,
        entity_data: `${action}: ${affected}/${entities.length} entities [${dateRange}] | ${bulkNames}${entities.length > 5 ? "..." : ""}`,
        remark,
        status: affected > 0 ? "updated" : "not",
        changed_field: allSameType ? `${entityType}_exclusion` : "bulk_exclusion",
        old_value: action === "exclude" ? "included" : "excluded",
        new_value: `${action}: ${affected}/${entities.length} entities [${dateRange}]`,
    };
};

// ── Display Order (for unified activity-log API) ──────────────
const pickReviewPublishDate = (body) => body.date ?? body.collection_date ?? body.Date ?? null;

const pickReviewPublishStationCode = (body) =>
    body.station_code ?? body.station_id ?? null;

const formatReviewPublishStationLabel = (stationName, stationCode) => {
    if (stationName && stationCode != null) return `${stationName} (${stationCode})`;
    if (stationName) return stationName;
    if (stationCode != null) return `station ${stationCode}`;
    return "station";
};

const buildReviewPublishLogFields = (body) => {
    const remark = body.remark?.trim() || null;
    const status = body.status || "updated";
    const date = pickReviewPublishDate(body);
    const stationCode = pickReviewPublishStationCode(body);
    const stationName = body.station_name ?? null;

    if (body.action_type === "PAGE_ACCESS") {
        return {
            entity_type: "page",
            entity_name: body.entity_name || "Review & Publish",
            entity_data:
                body.entity_data ||
                `Page accessed${date ? ` | date: ${date}` : ""}`,
            changed_field: "page_access",
            old_value: body.old_value ?? null,
            new_value: body.new_value ?? date ?? "Review & Publish",
            remark,
            status,
        };
    }

    if (body.action_type === "VERIFY") {
        const label = formatReviewPublishStationLabel(stationName, stationCode);
        return {
            entity_type: "station",
            entity_name: stationName || (stationCode != null ? String(stationCode) : null),
            entity_data: body.entity_data || `verified | ${label}${date ? ` | date: ${date}` : ""}`,
            changed_field: "is_verified",
            old_value: body.old_value ?? "not verified",
            new_value: body.new_value ?? "verified",
            remark,
            status,
        };
    }

    if (body.action_type === "BULK_VERIFY") {
        const count = body.station_count ?? body.station_ids?.length ?? null;
        return {
            entity_type: "station",
            entity_name: body.entity_name || (count != null ? `${count} stations` : "bulk verify"),
            entity_data:
                body.entity_data ||
                `bulk verified ${count ?? "?"} stations${date ? ` | date: ${date}` : ""}`,
            changed_field: "is_verified",
            old_value: body.old_value ?? "not verified",
            new_value: body.new_value ?? (count != null ? `verified: ${count}` : "verified"),
            remark,
            status,
        };
    }

    if (body.action_type === "UPDATE") {
        const label = formatReviewPublishStationLabel(stationName, stationCode);
        const oldVal = body.old_value ?? body.value_before;
        const newVal = body.new_value ?? body.value;
        return {
            entity_type: "station",
            entity_name: stationName || (stationCode != null ? String(stationCode) : null),
            entity_data:
                body.entity_data ||
                `updated rainfall | ${label}${date ? ` | date: ${date}` : ""}${
                    oldVal != null || newVal != null ? ` | ${oldVal ?? "?"} → ${newVal ?? "?"} mm` : ""
                }`,
            changed_field: "rainfall",
            old_value: oldVal != null ? String(oldVal) : null,
            new_value: newVal != null ? String(newVal) : null,
            remark,
            status,
        };
    }

    if (body.action_type === "PUBLISH") {
        return {
            entity_type: "publish",
            entity_name: body.entity_name || "Station daily data",
            entity_data: body.entity_data || body.message || "Published reviewed data to map",
            changed_field: "published",
            old_value: body.old_value ?? "staging",
            new_value: body.new_value ?? "published",
            remark,
            status,
        };
    }

    if (body.action_type === "UPLOAD") {
        const fileName = body.file_name ?? body.fileName;
        const rowCount = body.row_count ?? body.entity_count;
        return {
            entity_type: "file",
            entity_name: fileName || "rainfall file",
            entity_data:
                body.entity_data ||
                `uploaded rainfall file | ${fileName || "file"} | ${rowCount ?? "?"} rows`,
            changed_field: "rainfall_file",
            old_value: body.old_value ?? null,
            new_value: body.new_value ?? "uploaded",
            remark,
            status,
        };
    }

    return {
        entity_type: body.entity_type ?? "station",
        entity_name: body.entity_name ?? stationName ?? (stationCode != null ? String(stationCode) : null),
        entity_data: body.entity_data ?? null,
        changed_field: body.changed_field ?? "review_publish",
        old_value: body.old_value ?? null,
        new_value: body.new_value ?? null,
        remark,
        status,
    };
};

const logReviewPublishActivity = async (action_type, req, extra = {}) =>
    safeLogActivity("REVIEW PUBLISH", {
        req,
        page: PAGES.reviewPublish,
        action_type,
        ...buildReviewPublishLogFields({ ...req.body, ...extra, action_type }),
    });

const logReviewPublishPageAccess = async (req, date) =>
    logReviewPublishActivity("PAGE_ACCESS", req, { date });

const buildDisplayOrderLogFields = (body) => {
    const entityType = body.entity_type;
    const row = {
        display_order: body.display_order,
        district_code: body.district_code,
        district_name: body.district_name,
        state_code: body.state_code,
        state_name: body.state_name,
        region_code: body.region_code,
        region_name: body.region_name,
        subdiv_code: body.subdiv_code,
        subdivision_name: body.subdivision_name,
    };
    const summary = formatDisplayOrderSummary(entityType, row);
    const name = displayOrderEntityName(entityType, row);

    if (body.action_type === "PAGE_ACCESS") {
        const tabLabel = entityType;
        return {
            entity_type: entityType,
            entity_name: body.entity_name || `${tabLabel} display order`,
            entity_data: body.entity_data || `Page accessed | ${tabLabel} tab`,
            changed_field: "page_access",
            old_value: body.old_value ?? null,
            new_value: body.new_value ?? body.current_tab ?? tabLabel,
            remark: body.remark?.trim() || null,
            status: body.status || "updated",
        };
    }

    if (body.action_type === "ADD") {
        return {
            entity_type: entityType,
            entity_name: name,
            entity_data: body.entity_data || `added to display order | ${summary}`,
            changed_field: "display_order",
            old_value: body.old_value ?? null,
            new_value: body.new_value ?? summary,
            remark: body.remark?.trim() || null,
            status: body.status || "updated",
        };
    }

    if (body.action_type === "DELETE") {
        return {
            entity_type: entityType,
            entity_name: name,
            entity_data: body.entity_data || `removed from display order | ${summary}`,
            changed_field: "display_order",
            old_value: body.old_value ?? summary,
            new_value: body.new_value ?? "removed",
            remark: body.remark?.trim() || null,
            status: body.status || "updated",
        };
    }

    if (body.action_type === "REORDER") {
        return {
            entity_type: entityType,
            entity_name: body.entity_name || `${entityType} display order`,
            entity_data: body.entity_data || `reordered ${entityType} display order`,
            changed_field: "display_order",
            old_value: body.old_value ?? null,
            new_value: body.new_value ?? null,
            remark: body.remark?.trim() || null,
            status: body.status || "updated",
        };
    }

    return {
        entity_type: entityType,
        entity_name: body.entity_name || name,
        entity_data: body.entity_data,
        changed_field: body.changed_field || "display_order",
        old_value: body.old_value ?? null,
        new_value: body.new_value ?? null,
        remark: body.remark?.trim() || null,
        status: body.status || "updated",
    };
};

const resolvePage = (body) => {
    if (body.page_key && PAGES[body.page_key]) return PAGES[body.page_key];
    if (body.module_name && body.page_name && body.route_path) {
        return {
            module_name: body.module_name,
            category_name: body.category_name ?? null,
            page_name: body.page_name,
            route_path: body.route_path,
        };
    }
    return null;
};

const isSpatialBoundaryPageKey = (pageKey) =>
    SPATIAL_BOUNDARY_PAGE_KEYS.includes(pageKey);

const isNormalsPageKey = (pageKey) => NORMALS_PAGE_KEYS.includes(pageKey);

const isGeoAdminPageKey = (pageKey) =>
    isSpatialBoundaryPageKey(pageKey) || isNormalsPageKey(pageKey);

const pickSpatialEntityCode = (body) =>
    body.entity_code ??
    body.country_code ??
    body.district_code ??
    body.state_code ??
    body.region_code ??
    body.subdiv_code ??
    body.block_code ??
    body.file_name ??
    body.fileName ??
    null;

const pickSpatialEntityName = (body) =>
    body.entity_name ??
    body.country_name ??
    body.district_name ??
    body.state_name ??
    body.region_name ??
    body.subdivision_name ??
    body.subdiv_name ??
    body.block_name ??
    body.display_name ??
    (body.file_name || body.fileName)?.replace?.(/\.json$/i, "") ??
    null;

const formatSpatialEntityLabel = (entityType, code, name) => {
    if (name && code != null) return `${name} (${code})`;
    if (name) return name;
    if (code != null) return `${entityType} ${code}`;
    return entityType;
};

const buildSpatialBoundaryLogFields = (pageKey, body) => {
    const entityType = body.entity_type || GEO_ADMIN_PAGE_ENTITY_TYPE[pageKey];
    const code = pickSpatialEntityCode(body);
    const name = pickSpatialEntityName(body);
    const label = formatSpatialEntityLabel(entityType, code, name);
    const remark = body.remark?.trim() || null;
    const status = body.status || "updated";

    if (body.action_type === "PAGE_ACCESS") {
        return {
            entity_type: entityType,
            entity_name: body.page_name || PAGES[pageKey]?.page_name || entityType,
            entity_data: body.entity_data || `Page accessed | ${PAGES[pageKey]?.page_name || entityType}`,
            changed_field: "page_access",
            old_value: body.old_value ?? null,
            new_value: body.new_value ?? body.current_view ?? PAGES[pageKey]?.page_name ?? null,
            remark,
            status,
        };
    }

    if (body.action_type === "UPLOAD") {
        const folder = body.folder;
        const fileName = body.file_name ?? body.fileName;
        const version = body.version ?? 1;
        const featureCount = body.feature_count ?? body.featureCount;
        return {
            entity_type: "geojson",
            entity_name: fileName || name,
            entity_data:
                body.entity_data ||
                `uploaded ${fileName || "file"} to ${folder || "folder"} | ${featureCount ?? "?"} features | v${version}`,
            changed_field: "geojson_file",
            old_value: body.old_value ?? (body.old_version != null ? `v${body.old_version}` : null),
            new_value: body.new_value ?? `v${version}`,
            remark,
            status,
        };
    }

    if (
        ["REPLACE_NORMALS", "ADD_YEAR_NORMALS", "BULK_REPLACE_NORMALS", "BULK_ADD_YEAR_NORMALS"].includes(
            body.action_type
        )
    ) {
        const yearPart = body.year != null ? ` | year: ${body.year}` : "";
        const countPart = body.entity_count != null ? ` | count: ${body.entity_count}` : "";
        const summary = `${body.action_type.replace(/_/g, " ").toLowerCase()} | ${label}${yearPart}${countPart}`;
        return {
            entity_type: entityType,
            entity_name: name || (code != null ? String(code) : null),
            entity_data: body.entity_data || summary,
            changed_field: "normals",
            old_value: body.old_value ?? null,
            new_value: body.new_value ?? summary,
            remark,
            status,
        };
    }

    if (body.action_type === "ADD_DISTRICT") {
        const summary = `added district | ${label}`;
        return {
            entity_type: entityType,
            entity_name: name || (code != null ? String(code) : null),
            entity_data: body.entity_data || summary,
            changed_field: "district_details",
            old_value: body.old_value ?? null,
            new_value: body.new_value ?? summary,
            remark,
            status,
        };
    }

    if (body.action_type === "DOWNLOAD_TEMPLATE") {
        const summary = `downloaded normals template | ${label}`;
        return {
            entity_type: entityType,
            entity_name: name || (code != null ? String(code) : null),
            entity_data: body.entity_data || summary,
            changed_field: "template_download",
            old_value: body.old_value ?? null,
            new_value: body.new_value ?? "downloaded",
            remark,
            status: "updated",
        };
    }

    return {
        entity_type: entityType,
        entity_name: body.entity_name ?? name ?? (code != null ? String(code) : null),
        entity_data: body.entity_data ?? (label !== entityType ? label : null),
        changed_field: body.changed_field ?? entityType,
        old_value: body.old_value ?? null,
        new_value: body.new_value ?? null,
        remark,
        status,
    };
};

module.exports = {
    PAGES,
    ADMIN_PAGE_ROUTES: Object.values(PAGES).map((p) => p.route_path),
    DISPLAY_ORDER_ENTITY_TYPE,
    REVIEW_PUBLISH_ACTIONS,
    SPATIAL_BOUNDARY_PAGE_KEYS,
    NORMALS_PAGE_KEYS,
    SPATIAL_BOUNDARY_ACTIONS,
    NORMALS_ACTIONS,
    SPATIAL_PAGE_ENTITY_TYPE,
    NORMALS_PAGE_ENTITY_TYPE,
    logActivity,
    safeLogActivity,
    extractUserFromRequest,
    getActionDateTime,
    validateOfficerFields,
    calcModeLabel,
    resolvePage,
    isSpatialBoundaryPageKey,
    isNormalsPageKey,
    isGeoAdminPageKey,
    buildDisplayOrderLogFields,
    buildReviewPublishLogFields,
    buildSpatialBoundaryLogFields,
    validateGeoAdminPayload,
    logCalcModePageAccess,
    logCalcModeToggle,
    logReviewPublishActivity,
    logReviewPublishPageAccess,
    buildExclusionLog,
    buildBulkExclusionLog,
    logExclusionActivity,
};
