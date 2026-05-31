const client = require("../connection");

// Returns true if use_aws = 1, false otherwise
const isAwsEnabled = async () => {
    try {
        const result = await client.query(
            `SELECT use_aws FROM calculations_imd_aws WHERE id = 1`
        );
        return result.rows.length > 0 && result.rows[0].use_aws === 1;
    } catch {
        return false; // default to IMD-only if table missing
    }
};

module.exports = { isAwsEnabled };
