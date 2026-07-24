const client = require("../../../connection");
const {
    buildExclusionLog,
    buildBulkExclusionLog,
    logExclusionActivity,
} = require("../../../utils/activityLogger");

const VALID_TYPES = ['station', 'block', 'district', 'state', 'subdivision', 'region'];

const requireRemark = (req, res, { required = false } = {}) => {
    const remark = req.body?.remark?.trim() || null;
    if (required && !remark) {
        res.status(400).json({ success: false, message: "remark is required" });
        return null;
    }
    return remark;
};

function validateInput(entity_type, entity_code, from_date, to_date) {
    if (!entity_type || !entity_code || !from_date) {
        return "entity_type, entity_code and from_date are required";
    }
    if (!VALID_TYPES.includes(entity_type.toLowerCase())) {
        return `entity_type must be one of: ${VALID_TYPES.join(', ')}`;
    }
    const start = new Date(from_date);
    const end   = new Date(to_date || from_date);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return "Invalid date format. Use YYYY-MM-DD";
    }
    if (start > end) {
        return "from_date must be less than or equal to to_date";
    }
    return null;
}


// ─────────────────────────────────────────────────────────────
// POST /api/v1/calculation-exclusion/toggle
// ─────────────────────────────────────────────────────────────
exports.toggleExclusion = async (req, res) => {
    try {
        let { entity_type, entity_code, entity_name, from_date, to_date } = req.body;

        entity_type = entity_type?.trim().toLowerCase();
        to_date     = to_date || from_date;

        const err = validateInput(entity_type, entity_code, from_date, to_date);
        if (err) return res.status(400).json({ success: false, message: err });

        const remark = requireRemark(req, res);

        const existing = await client.query(
            `SELECT id FROM calculation_exclusions
             WHERE entity_type = $1
               AND entity_code = $2
               AND from_date   = $3
               AND to_date     = $4`,
            [entity_type, entity_code, from_date, to_date]
        );

        let newState;
        let isUpdated;

        if (existing.rows.length > 0) {
            const result = await client.query(
                `DELETE FROM calculation_exclusions
                 WHERE entity_type = $1
                   AND entity_code = $2
                   AND from_date   = $3
                   AND to_date     = $4
                 RETURNING id`,
                [entity_type, entity_code, from_date, to_date]
            );
            newState = "included";
            isUpdated = result.rows.length > 0;
        } else {
            const result = await client.query(
                `INSERT INTO calculation_exclusions
                    (entity_type, entity_code, entity_name, from_date, to_date)
                 VALUES ($1, $2, $3, $4, $5)
                 ON CONFLICT (entity_type, entity_code, from_date, to_date) DO NOTHING
                 RETURNING id`,
                [entity_type, entity_code, entity_name || null, from_date, to_date]
            );
            newState = "excluded";
            isUpdated = result.rows.length > 0;
        }

        await logExclusionActivity(buildExclusionLog({
            req,
            remark,
            entity_type,
            entity_name,
            entity_code,
            from_date,
            to_date,
            action_type: newState === "excluded" ? "EXCLUDE" : "INCLUDE",
            oldState: newState === "excluded" ? "included" : "excluded",
            newState,
            isUpdated,
        }));

        res.json({
            success:        true,
            message:        `${entity_name || `${entity_type} ${entity_code}`} is now ${newState} from calculation`,
            state:          newState,
            entity_type,
            entity_code,
            from_date,
            to_date,
            is_single_date: from_date === to_date,
        });

    } catch (error) {
        console.error("toggleExclusion error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};


// ─────────────────────────────────────────────────────────────
// POST /api/v1/calculation-exclusion/exclude  (checkbox unchecked)
// ─────────────────────────────────────────────────────────────
exports.excludeEntity = async (req, res) => {
    try {
        let { entity_type, entity_code, entity_name, from_date, to_date } = req.body;

        entity_type = entity_type?.trim().toLowerCase();
        to_date     = to_date || from_date;

        const err = validateInput(entity_type, entity_code, from_date, to_date);
        if (err) return res.status(400).json({ success: false, message: err });

        const remark = requireRemark(req, res, { required: true });
        if (!remark) return;

        const result = await client.query(
            `INSERT INTO calculation_exclusions
                (entity_type, entity_code, entity_name, from_date, to_date)
             VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT (entity_type, entity_code, from_date, to_date) DO NOTHING
             RETURNING *`,
            [entity_type, entity_code, entity_name || null, from_date, to_date]
        );

        const alreadyExcluded = result.rows.length === 0;

        await logExclusionActivity(buildExclusionLog({
            req,
            remark,
            entity_type,
            entity_name,
            entity_code,
            from_date,
            to_date,
            action_type: "EXCLUDE",
            oldState: "included",
            newState: "excluded",
            isUpdated: !alreadyExcluded,
        }));

        res.json({
            success:         true,
            message:         alreadyExcluded
                               ? `Already excluded for this date range`
                               : `Excluded from calculation`,
            already_existed: alreadyExcluded,
            data:            alreadyExcluded ? null : result.rows[0]
        });

    } catch (error) {
        console.error('excludeEntity error:', error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};


// ─────────────────────────────────────────────────────────────
// POST /api/v1/calculation-exclusion/include  (checkbox checked)
// ─────────────────────────────────────────────────────────────
exports.includeEntity = async (req, res) => {
    try {
        let { entity_type, entity_code, entity_name, from_date, to_date } = req.body;

        entity_type = entity_type?.trim().toLowerCase();
        to_date     = to_date || from_date;

        const err = validateInput(entity_type, entity_code, from_date, to_date);
        if (err) return res.status(400).json({ success: false, message: err });

        const remark = requireRemark(req, res, { required: true });
        if (!remark) return;

        const result = await client.query(
            `DELETE FROM calculation_exclusions
             WHERE entity_type = $1
               AND entity_code = $2
               AND from_date  >= $3
               AND to_date    <= $4
             RETURNING *`,
            [entity_type, entity_code, from_date, to_date]
        );

        const wasAlreadyIncluded = result.rows.length === 0;

        await logExclusionActivity(buildExclusionLog({
            req,
            remark,
            entity_type,
            entity_name,
            entity_code,
            from_date,
            to_date,
            action_type: "INCLUDE",
            oldState: "excluded",
            newState: "included",
            isUpdated: !wasAlreadyIncluded,
        }));

        res.json({
            success:              true,
            message:              wasAlreadyIncluded
                                    ? `Entity was already included`
                                    : `Entity re-included in calculations`,
            was_already_included: wasAlreadyIncluded
        });

    } catch (error) {
        console.error('includeEntity error:', error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};


// ─────────────────────────────────────────────────────────────
// POST /api/v1/calculation-exclusion/get-exclusions
// ─────────────────────────────────────────────────────────────
exports.getExclusions = async (req, res) => {
    try {
        let { entity_type, from_date, to_date } = req.body;

        entity_type = entity_type?.trim().toLowerCase() || null;
        to_date     = to_date || from_date || null;

        const conditions = [];
        const params     = [];
        let   paramIdx   = 1;

        if (entity_type) {
            if (!VALID_TYPES.includes(entity_type)) {
                return res.status(400).json({
                    success: false,
                    message: `entity_type must be one of: ${VALID_TYPES.join(', ')}`
                });
            }
            conditions.push(`entity_type = $${paramIdx++}`);
            params.push(entity_type);
        }

        if (from_date && to_date) {
            conditions.push(`from_date <= $${paramIdx++} AND to_date >= $${paramIdx++}`);
            params.push(to_date, from_date);
        } else if (from_date) {
            conditions.push(`from_date <= $${paramIdx++} AND to_date >= $${paramIdx++}`);
            params.push(from_date, from_date);
        }

        const whereClause = conditions.length > 0
            ? `WHERE ${conditions.join(' AND ')}`
            : '';

        const result = await client.query(
            `SELECT
                id,
                entity_type,
                entity_code,
                entity_name,
                from_date,
                to_date,
                excluded_at,
                (from_date = to_date) AS is_single_date
             FROM calculation_exclusions
             ${whereClause}
             ORDER BY entity_type, entity_name, from_date`,
            params
        );

        res.json({
            success:    true,
            message:    "Exclusions fetched successfully",
            count:      result.rows.length,
            exclusions: result.rows
        });

    } catch (error) {
        console.error('getExclusions error:', error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};


// ─────────────────────────────────────────────────────────────
// POST /api/v1/calculation-exclusion/check-status
// ─────────────────────────────────────────────────────────────
exports.checkStatus = async (req, res) => {
    try {
        let { entity_type, entity_code, from_date, to_date } = req.body;

        entity_type = entity_type?.trim().toLowerCase();
        to_date     = to_date || from_date;

        const err = validateInput(entity_type, entity_code, from_date, to_date);
        if (err) return res.status(400).json({ success: false, message: err });

        const result = await client.query(
            `SELECT id, from_date, to_date, excluded_at
             FROM calculation_exclusions
             WHERE entity_type = $1
               AND entity_code = $2
               AND from_date  <= $3
               AND to_date    >= $4`,
            [entity_type, entity_code, to_date, from_date]
        );

        res.json({
            success:           true,
            entity_type,
            entity_code,
            from_date,
            to_date,
            is_excluded:       result.rows.length > 0,
            exclusion_records: result.rows
        });

    } catch (error) {
        console.error('checkStatus error:', error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};


// ─────────────────────────────────────────────────────────────
// POST /api/v1/calculation-exclusion/bulk  (Include All / Exclude All)
// ─────────────────────────────────────────────────────────────
exports.bulkExclusion = async (req, res) => {
    try {
        let { action, from_date, to_date, entities } = req.body;

        to_date = to_date || from_date;

        if (!action || !['exclude', 'include'].includes(action)) {
            return res.status(400).json({
                success: false,
                message: 'action must be "exclude" or "include"'
            });
        }
        if (!from_date) {
            return res.status(400).json({ success: false, message: 'from_date is required' });
        }
        if (!entities || !Array.isArray(entities) || entities.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'entities array is required and must not be empty'
            });
        }

        const remark = requireRemark(req, res, { required: true });
        if (!remark) return;

        for (const e of entities) {
            if (!VALID_TYPES.includes(e.entity_type?.trim().toLowerCase())) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid entity_type: ${e.entity_type}`
                });
            }
        }

        let affected = 0;

        if (action === 'exclude') {

            // Bulk INSERT — one query for all entities
            const valuePlaceholders = entities.map((_, i) =>
                `($${i * 5 + 1}, $${i * 5 + 2}, $${i * 5 + 3}, $${i * 5 + 4}, $${i * 5 + 5})`
            ).join(', ');

            const params = entities.flatMap(e => [
                e.entity_type.trim().toLowerCase(),
                e.entity_code,
                e.entity_name || null,
                from_date,
                to_date
            ]);

            const result = await client.query(
                `INSERT INTO calculation_exclusions
                    (entity_type, entity_code, entity_name, from_date, to_date)
                 VALUES ${valuePlaceholders}
                 ON CONFLICT (entity_type, entity_code, from_date, to_date) DO NOTHING`,
                params
            );
            affected = result.rowCount;

        } else {

            // Bulk DELETE — one query using ANY() instead of N queries
            const codes = entities.map(e => e.entity_code);
            const type  = entities[0].entity_type.trim().toLowerCase();

            const result = await client.query(
                `DELETE FROM calculation_exclusions
                 WHERE entity_type = $1
                   AND entity_code = ANY($2::bigint[])
                   AND from_date  >= $3
                   AND to_date    <= $4`,
                [type, codes, from_date, to_date]
            );
            affected = result.rowCount;
        }

        const entityType = entities[0].entity_type?.trim().toLowerCase();
        const allSameType = entities.every(
            (e) => e.entity_type?.trim().toLowerCase() === entityType
        );

        await logExclusionActivity(buildBulkExclusionLog({
            req,
            remark,
            action,
            entities,
            entityType,
            allSameType,
            affected,
            from_date,
            to_date,
        }));

        res.json({
            success:        true,
            message:        `${action === 'exclude' ? 'Excluded' : 'Included'} ${affected} of ${entities.length} entities`,
            affected,
            total:          entities.length,
            from_date,
            to_date,
            is_single_date: from_date === to_date
        });

    } catch (error) {
        console.error('bulkExclusion error:', error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};