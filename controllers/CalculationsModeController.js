const client = require("../connection");

// GET /api/v1/calculations-mode
// Returns { use_aws: 0 or 1 }
exports.getMode = async (req, res) => {
    try {
        const result = await client.query(
            `SELECT use_aws FROM calculations_imd_aws WHERE id = 1`
        );
        const use_aws = result.rows.length > 0 ? result.rows[0].use_aws : 0;
        res.status(200).json({ success: true, use_aws });
    } catch (error) {
        console.error("[CALC MODE] getMode:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// POST /api/v1/calculations-mode
// Body: { use_aws: 0 or 1 }
exports.setMode = async (req, res) => {
    try {
        const { use_aws } = req.body;
        if (use_aws !== 0 && use_aws !== 1) {
            return res.status(400).json({ success: false, message: "use_aws must be 0 or 1" });
        }
        await client.query(
            `INSERT INTO calculations_imd_aws (id, use_aws, updated_at)
             VALUES (1, $1, now())
             ON CONFLICT (id) DO UPDATE SET use_aws = $1, updated_at = now()`,
            [use_aws]
        );
        res.status(200).json({
            success: true,
            message: `Calculation mode set to ${use_aws === 1 ? 'IMD + AWS' : 'IMD only'}`,
            use_aws
        });
    } catch (error) {
        console.error("[CALC MODE] setMode:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
