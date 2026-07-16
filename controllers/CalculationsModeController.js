const client = require("../connection");
const {
    validateOfficerFields,
    calcModeLabel,
    extractUserFromRequest,
    logCalcModePageAccess,
    logCalcModeToggle,
} = require("../utils/activityLogger");
const { broadcastPageStateChanged } = require("../utils/adminRealtime");
const { fetchCalcModeState, CALC_MODE_ROUTE } = require("../utils/calcModeState");

const parseExpectedUpdatedAt = (value) => {
    if (value == null || value === "") return null;
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed;
};

// GET /api/v1/calculations-mode
exports.getMode = async (req, res) => {
    try {
        const state = await fetchCalcModeState();
        res.status(200).json({ success: true, ...state });
    } catch (error) {
        console.error("[CALC MODE] getMode:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// POST /api/v1/calculations-mode/officer-access
// Officer Identification modal — save when user clicks Continue
exports.recordOfficerAccess = async (req, res) => {
    try {
        const err = validateOfficerFields(req.body);
        if (err) return res.status(400).json({ success: false, message: err });

        const state = await fetchCalcModeState();
        await logCalcModePageAccess(req, state.use_aws_label);

        res.status(200).json({
            success: true,
            message: "Officer access recorded",
            ...state,
        });
    } catch (error) {
        console.error("[CALC MODE] recordOfficerAccess:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// POST /api/v1/calculations-mode
// Body: { use_aws: 0 or 1, expected_updated_at?: ISO string, emp_name, ... }
exports.setMode = async (req, res) => {
    try {
        const { use_aws, expected_updated_at } = req.body;
        if (use_aws !== 0 && use_aws !== 1) {
            return res.status(400).json({ success: false, message: "use_aws must be 0 or 1" });
        }

        const expectedTs = parseExpectedUpdatedAt(expected_updated_at);
        if (expected_updated_at != null && expected_updated_at !== "" && expectedTs === undefined) {
            return res.status(400).json({
                success: false,
                message: "expected_updated_at must be a valid ISO timestamp",
            });
        }

        const prev = await client.query(
            `SELECT use_aws FROM calculations_imd_aws WHERE id = 1`
        );
        const use_aws_before = prev.rows.length > 0 ? prev.rows[0].use_aws : 0;

        const updateResult = await client.query(
            `INSERT INTO calculations_imd_aws (id, use_aws, updated_at)
             VALUES (1, $1, now())
             ON CONFLICT (id) DO UPDATE
             SET use_aws = EXCLUDED.use_aws, updated_at = now()
             WHERE $2::timestamptz IS NULL OR calculations_imd_aws.updated_at = $2
             RETURNING use_aws, updated_at`,
            [use_aws, expectedTs]
        );

        if (updateResult.rows.length === 0) {
            const currentState = await fetchCalcModeState();
            return res.status(409).json({
                success: false,
                code: "STALE_MODE",
                message: "Calculation mode was changed by another officer. Refresh and try again.",
                ...currentState,
            });
        }

        const { updated_at } = updateResult.rows[0];
        const changed_by = extractUserFromRequest(req);

        if (use_aws_before !== use_aws) {
            await logCalcModeToggle(req, use_aws_before, use_aws);
        }

        const payload = {
            use_aws,
            use_aws_before,
            use_aws_label: calcModeLabel(use_aws),
            use_aws_before_label: calcModeLabel(use_aws_before),
            updated_at,
            changed_by,
            changed: use_aws_before !== use_aws,
        };

        broadcastPageStateChanged(CALC_MODE_ROUTE, "calculation_mode", payload);

        res.status(200).json({
            success: true,
            message: `Calculation mode set to ${use_aws === 1 ? "IMD + AWS" : "IMD only"}`,
            ...payload,
        });
    } catch (error) {
        console.error("[CALC MODE] setMode:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
