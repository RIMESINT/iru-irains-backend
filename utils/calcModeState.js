const client = require("../connection");
const { calcModeLabel } = require("./activityLogger");

const CALC_MODE_ROUTE = "/data-management/calculation-mode";

const fetchCalcModeState = async () => {
    const result = await client.query(
        `SELECT
            c.use_aws,
            c.updated_at,
            l.emp_name AS last_changed_by_name,
            l.login_id AS last_changed_by_login_id,
            l.old_value AS last_old_value,
            l.new_value AS last_new_value,
            l.action_date AS last_action_date,
            l.action_time AS last_action_time,
            l.created_at AS last_changed_at
         FROM public.calculations_imd_aws c
         LEFT JOIN LATERAL (
            SELECT emp_name, login_id, old_value, new_value, action_date, action_time, created_at
            FROM public.admin_activity_logs
            WHERE route_path = $1 AND action_type = 'TOGGLE'
            ORDER BY created_at DESC
            LIMIT 1
         ) l ON TRUE
         WHERE c.id = 1`,
        [CALC_MODE_ROUTE]
    );

    const row = result.rows[0];
    const use_aws = row ? row.use_aws : 0;

    return {
        use_aws,
        use_aws_label: calcModeLabel(use_aws),
        updated_at: row?.updated_at ?? null,
        last_changed_by: row?.last_changed_by_name
            ? {
                  login_id: row.last_changed_by_login_id,
                  emp_name: row.last_changed_by_name,
              }
            : null,
        last_toggle: row?.last_changed_at
            ? {
                  old_value: row.last_old_value,
                  new_value: row.last_new_value,
                  action_date: row.last_action_date,
                  action_time: row.last_action_time,
                  changed_at: row.last_changed_at,
              }
            : null,
    };
};

module.exports = {
    CALC_MODE_ROUTE,
    fetchCalcModeState,
};
