const client = require("../connection");
const {
    logActivity,
    resolvePage,
    buildDisplayOrderLogFields,
    buildReviewPublishLogFields,
    buildSpatialBoundaryLogFields,
    validateGeoAdminPayload,
    isNormalsPageKey,
    isGeoAdminPageKey,
    PAGES,
    ADMIN_PAGE_ROUTES,
    SPATIAL_BOUNDARY_ACTIONS,
    NORMALS_ACTIONS,
    REVIEW_PUBLISH_ACTIONS,
} = require("../utils/activityLogger");
const { resolveOfficerIdentity } = require("../utils/officerPassKey");

const DISPLAY_ORDER_ACTIONS = ["PAGE_ACCESS", "ADD", "DELETE", "REORDER"];
const DISPLAY_ORDER_ENTITIES = ["district", "state", "subdivision"];

const validateReviewPublishPayload = (body, action_type) => {
    if (!REVIEW_PUBLISH_ACTIONS.includes(action_type)) {
        return `action_type for reviewPublish must be one of: ${REVIEW_PUBLISH_ACTIONS.join(", ")}`;
    }
    if (["VERIFY", "UPDATE"].includes(action_type) && body.station_code == null && body.station_id == null) {
        return "station_code or station_id is required";
    }
    if (["VERIFY", "BULK_VERIFY", "UPDATE"].includes(action_type) && !body.date && !body.collection_date) {
        return "date is required";
    }
    if (
        action_type === "BULK_VERIFY" &&
        (!Array.isArray(body.station_ids) || body.station_ids.length === 0) &&
        body.station_count == null
    ) {
        return "station_ids or station_count is required for BULK_VERIFY";
    }
    if (action_type === "UPDATE" && body.value == null && body.new_value == null) {
        return "value is required for UPDATE";
    }
    if (action_type === "UPLOAD" && !body.file_name && !body.fileName && !body.entity_data) {
        return "file_name is required for UPLOAD";
    }
    return null;
};

const buildLogQueryFilters = (query) => {
    const conditions = [];
    const params = [];
    let idx = 1;

    const addFilter = (column, value) => {
        if (value == null || value === "") return;
        conditions.push(`${column} = $${idx}`);
        params.push(value);
        idx += 1;
    };

    addFilter("module_name", query.module_name);
    addFilter("category_name", query.category_name);
    addFilter("page_name", query.page_name);
    addFilter("route_path", query.route_path);
    addFilter("action_type", query.action_type);
    addFilter("entity_type", query.entity_type);
    addFilter("login_id", query.login_id);

    // HQ / MC / SP shared login role — all officers under that role are returned
    if (query.mcorhq_type != null && query.mcorhq_type !== "") {
        conditions.push(`LOWER(TRIM(mcorhq_type)) = $${idx}`);
        params.push(String(query.mcorhq_type).trim().toLowerCase());
        idx += 1;
    }
    // Optional officer name (partial match) within the selected login type
    if (query.emp_name) {
        conditions.push(`emp_name ILIKE $${idx}`);
        params.push(`%${String(query.emp_name).trim()}%`);
        idx += 1;
    }

    if (query.from_date) {
        conditions.push(`action_date >= $${idx}`);
        params.push(query.from_date);
        idx += 1;
    }
    if (query.to_date) {
        conditions.push(`action_date <= $${idx}`);
        params.push(query.to_date);
        idx += 1;
    }

    return {
        whereClause: conditions.length ? `WHERE ${conditions.join(" AND ")}` : "",
        params,
        nextIdx: idx,
    };
};

const resolveLogFields = (page_key, body, action_type) => {
    if (page_key === "displayOrder") {
        if (!body.entity_type || !DISPLAY_ORDER_ENTITIES.includes(body.entity_type)) {
            return {
                error: `entity_type is required for displayOrder (one of: ${DISPLAY_ORDER_ENTITIES.join(", ")})`,
            };
        }
        if (!DISPLAY_ORDER_ACTIONS.includes(action_type)) {
            return {
                error: `action_type for displayOrder must be one of: ${DISPLAY_ORDER_ACTIONS.join(", ")}`,
            };
        }
        if (["ADD", "DELETE"].includes(action_type) && body.display_order == null) {
            return { error: "display_order is required" };
        }
        return { logFields: buildDisplayOrderLogFields(body) };
    }

    if (page_key === "reviewPublish") {
        const reviewErr = validateReviewPublishPayload(body, action_type);
        if (reviewErr) return { error: reviewErr };
        return { logFields: buildReviewPublishLogFields({ ...body, action_type }) };
    }

    if (isGeoAdminPageKey(page_key)) {
        const geoErr = validateGeoAdminPayload(
            body,
            action_type,
            isNormalsPageKey(page_key) ? NORMALS_ACTIONS : SPATIAL_BOUNDARY_ACTIONS,
            { requireDistrictForAddDistrict: isNormalsPageKey(page_key) }
        );
        if (geoErr) return { error: geoErr };
        return { logFields: buildSpatialBoundaryLogFields(page_key, { ...body, action_type }) };
    }

    return {
        logFields: {
            entity_type: body.entity_type ?? null,
            entity_name: body.entity_name ?? null,
            entity_data: body.entity_data ?? null,
            changed_field: body.changed_field ?? null,
            old_value: body.old_value ?? null,
            new_value: body.new_value ?? null,
            remark: body.remark?.trim() || null,
            status: body.status || "updated",
        },
    };
};

// POST /api/v1/admin/activity-log
exports.recordActivity = async (req, res) => {
    try {
        const officerResolved = await resolveOfficerIdentity(req.body, {
            requireRemarkWithPassKey: req.body?.action_type === "PAGE_ACCESS",
        });
        if (officerResolved.error) {
            return res.status(400).json({ success: false, message: officerResolved.error });
        }

        const { action_type, page_key } = req.body;
        if (!action_type) {
            return res.status(400).json({ success: false, message: "action_type is required" });
        }

        const page = resolvePage(req.body);
        if (!page) {
            return res.status(400).json({
                success: false,
                message: `page_key is required (one of: ${Object.keys(PAGES).join(", ")}) or send module_name, page_name, route_path`,
            });
        }

        const resolved = resolveLogFields(page_key, req.body, action_type);
        if (resolved.error) {
            return res.status(400).json({ success: false, message: resolved.error });
        }

        await logActivity({
            req,
            page,
            action_type,
            ...resolved.logFields,
        });

        res.status(200).json({ success: true, message: "Activity recorded" });
    } catch (error) {
        console.error("[ACTIVITY LOG] recordActivity:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET /api/v1/admin/activity-logs
exports.getActivityLogs = async (req, res) => {
    try {
        const { limit = "50", offset = "0" } = req.query;
        const { whereClause, params, nextIdx } = buildLogQueryFilters(req.query);
        const limitNum = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 200);
        const offsetNum = Math.max(parseInt(offset, 10) || 0, 0);

        const result = await client.query(
            `SELECT
                COUNT(*) OVER()::int AS total,
                id, login_id, emp_name, emp_designation, emp_phone_number, emp_email, mcorhq_type,
                module_name, category_name, page_name, route_path,
                action_type, changed_field, old_value, new_value,
                entity_type, entity_name, entity_data, remark, status,
                action_date, action_time, created_at
             FROM public.admin_activity_logs
             ${whereClause}
             ORDER BY action_date DESC, action_time DESC, id DESC
             LIMIT $${nextIdx} OFFSET $${nextIdx + 1}`,
            [...params, limitNum, offsetNum]
        );

        const total = result.rows[0]?.total ?? 0;
        const data = result.rows.map(({ total: _total, ...row }) => row);

        res.status(200).json({
            success: true,
            total,
            limit: limitNum,
            offset: offsetNum,
            data,
        });
    } catch (error) {
        console.error("[ACTIVITY LOG] getActivityLogs:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET /api/v1/admin/realtime-config
exports.getRealtimeConfig = async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            socket_path: "/socket.io",
            client_events: ["join_page", "leave_page", "heartbeat"],
            server_events: ["presence_update", "activity_logged", "page_state_changed"],
            pages: Object.entries(PAGES).map(([page_key, page]) => ({
                page_key,
                ...page,
            })),
            route_paths: ADMIN_PAGE_ROUTES,
        });
    } catch (error) {
        console.error("[ACTIVITY LOG] getRealtimeConfig:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
