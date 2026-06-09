const client = require('../../connection');
const { execSync } = require('child_process');

exports.getDbInfo = async (_req, res) => {
  try {
    // 1. All tables with size + row count
    const tablesResult = await client.query(`
      SELECT
        t.tablename                                                        AS table_name,
        c.reltuples::bigint                                                AS approx_rows,
        pg_size_pretty(pg_relation_size(t.schemaname||'.'||t.tablename))  AS data_size,
        pg_size_pretty(pg_indexes_size(t.schemaname||'.'||t.tablename))   AS index_size,
        pg_size_pretty(pg_total_relation_size(t.schemaname||'.'||t.tablename)) AS total_size,
        pg_total_relation_size(t.schemaname||'.'||t.tablename)            AS total_bytes
      FROM pg_tables t
      JOIN pg_class c ON c.relname = t.tablename AND c.relnamespace = (
        SELECT oid FROM pg_namespace WHERE nspname = t.schemaname
      )
      WHERE t.schemaname = 'public'
      ORDER BY pg_total_relation_size(t.schemaname||'.'||t.tablename) DESC
    `);

    // 2. Database overview
    const dbResult = await client.query(`
      SELECT
        current_database()                                  AS db_name,
        pg_size_pretty(pg_database_size(current_database())) AS db_size,
        pg_database_size(current_database())                AS db_bytes,
        version()                                           AS pg_version
    `);

    // 3. All databases sizes
    const allDbResult = await client.query(`
      SELECT datname AS name,
             pg_size_pretty(pg_database_size(datname)) AS size,
             pg_database_size(datname) AS bytes
      FROM pg_database
      WHERE datistemplate = false
      ORDER BY pg_database_size(datname) DESC
    `);

    // 4. Disk space (OS level)
    let diskInfo = null;
    try {
      const raw = execSync("df -k / | tail -1").toString().trim().split(/\s+/);
      // raw: [filesystem, 1K-blocks, used, available, use%, mounted-on]
      const totalKB  = parseInt(raw[1]);
      const usedKB   = parseInt(raw[2]);
      const freeKB   = parseInt(raw[3]);
      const pctUsed  = raw[4];
      const fmt = kb => {
        if (kb >= 1024 * 1024 * 1024) return (kb / (1024 * 1024 * 1024)).toFixed(1) + ' TB';
        if (kb >= 1024 * 1024)        return (kb / (1024 * 1024)).toFixed(1) + ' GB';
        if (kb >= 1024)               return (kb / 1024).toFixed(1) + ' MB';
        return kb + ' KB';
      };
      diskInfo = {
        total: fmt(totalKB),
        used:  fmt(usedKB),
        free:  fmt(freeKB),
        pct_used: pctUsed,
        total_bytes: totalKB * 1024,
        used_bytes:  usedKB  * 1024,
        free_bytes:  freeKB  * 1024,
      };
    } catch (_) {
      diskInfo = null;
    }

    res.status(200).json({
      success: true,
      db:      dbResult.rows[0],
      tables:  tablesResult.rows,
      all_dbs: allDbResult.rows,
      disk:    diskInfo,
    });
  } catch (err) {
    console.error('getDbInfo error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};
