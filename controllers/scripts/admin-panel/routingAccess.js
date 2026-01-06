const client = require("../../../connection");

// controllers/scripts/admin-panel/routingAccess.js

exports.getAllowedRoutes = async (req, res) => {
    try {
      let mcorhq_type = req.body?.mcorhq_type?.trim().toLowerCase();
  
      if (!mcorhq_type) {
        return res.status(400).json({
          success: false,
          message: "Missing mcorhq_type"
        });
      }
  
      // Map lowercase to uppercase for DB lookup
      const typeMap = {
        'hq': 'HQ',
        'mc': 'MC',
        'sp': 'SP',
        'public': 'PUBLIC'
      };
  
      const dbType = typeMap[mcorhq_type] || 'PUBLIC';
  
      const query = `
        SELECT route_path 
        FROM public.login_route_access 
        WHERE mcorhq_type = $1
        ORDER BY route_path;
      `;
  
      const result = await client.query(query, [dbType]);
      const allowedRoutes = result.rows.map(row => row.route_path);
  
      res.json({
        success: true,
        mcorhq_type: dbType,
        allowedRoutes,
        count: allowedRoutes.length
      });
  
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Server error"
      });
    }
  };