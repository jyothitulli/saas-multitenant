// import pool from '../config/db.js';

// /**
//  * 1. GET ALL TENANTS
//  */
// export const getAllTenants = async (req, res) => {
//   try {
//     const result = await pool.query('SELECT * FROM tenants');

//     res.status(200).json({
//       success: true,
//       message: 'All tenants retrieved',
//       data: result.rows,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// /**
//  * 2. GET TENANT BY ID
//  */
// export const getTenantById = async (req, res) => {
//   const { id } = req.params;

//   try {
//     const result = await pool.query(
//       'SELECT * FROM tenants WHERE id = $1',
//       [id]
//     );

//     if (result.rows.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: 'Tenant not found',
//       });
//     }

//     res.status(200).json({
//       success: true,
//       message: 'Tenant found',
//       data: result.rows[0],
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// /**
//  * 3. CREATE TENANT
//  */
// export const createTenant = async (req, res) => {
//   const { name, subdomain, subscription_plan } = req.body;

//   try {
//     const result = await pool.query(
//       `
//       INSERT INTO tenants 
//         (name, subdomain, subscription_plan, status, max_users, max_projects)
//       VALUES 
//         ($1, $2, $3, $4, $5, $6)
//       RETURNING *
//       `,
//       [
//         name,
//         subdomain,
//         subscription_plan || 'free',
//         'active',
//         5,
//         3,
//       ]
//     );

//     res.status(201).json({
//       success: true,
//       message: 'Tenant created successfully',
//       data: result.rows[0],
//     });
//   } catch (error) {
//     res.status(400).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// /**
//  * 4. UPDATE TENANT
//  */
// export const updateTenant = async (req, res) => {
//   const { id } = req.params;
//   const { name, status, subscription_plan } = req.body;

//   try {
//     const result = await pool.query(
//       `
//       UPDATE tenants
//       SET name = $1, status = $2, subscription_plan = $3
//       WHERE id = $4
//       RETURNING *
//       `,
//       [name, status, subscription_plan, id]
//     );

//     if (result.rows.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: 'Tenant not found',
//       });
//     }

//     res.status(200).json({
//       success: true,
//       message: 'Tenant updated successfully',
//       data: result.rows[0],
//     });
//   } catch (error) {
//     res.status(400).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// /**
//  * 5. DELETE TENANT
//  */
// export const deleteTenant = async (req, res) => {
//   const { id } = req.params;

//   try {
//     const result = await pool.query(
//       'DELETE FROM tenants WHERE id = $1 RETURNING *',
//       [id]
//     );

//     if (result.rows.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: 'Tenant not found',
//       });
//     }

//     res.status(200).json({
//       success: true,
//       message: 'Tenant deleted successfully',
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };
const { pool } = require('../config/db');

// 1. Get All Tenants (Point #15)
exports.getAllTenants = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM tenants');
        res.status(200).json({ 
            success: true, 
            message: 'All tenants retrieved', 
            data: result.rows 
        });
    } catch (err) {
        res.status(500).json({ 
            success: false, 
            message: err.message 
        });
    }
};

// 2. Get Single Tenant by ID (Point #16)
exports.getTenantById = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM tenants WHERE id = $1', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Tenant not found' 
            });
        }

        res.status(200).json({ 
            success: true, 
            message: 'Tenant found', 
            data: result.rows[0] 
        });
    } catch (err) {
        res.status(500).json({ 
            success: false, 
            message: err.message 
        });
    }
};

// 3. Create Tenant (Point #17 - The missing function causing the crash)
exports.createTenant = async (req, res) => {
    const { name, subdomain, subscription_plan } = req.body;
    try {
        // Insert the new tenant into the database
        const result = await pool.query(
            'INSERT INTO tenants (name, subdomain, subscription_plan, status, max_users, max_projects) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [name, subdomain, subscription_plan || 'free', 'active', 5, 3]
        );

        res.status(201).json({ 
            success: true, 
            message: 'Tenant created successfully', 
            data: result.rows[0] 
        });
    } catch (err) {
        // Handle duplicate subdomains or DB errors
        res.status(400).json({ 
            success: false, 
            message: err.message 
        });
    }
};

// 4. Update Tenant (Point #18)
exports.updateTenant = async (req, res) => {
    const { id } = req.params;
    const { name, status, subscription_plan } = req.body;
    try {
        const result = await pool.query(
            'UPDATE tenants SET name = $1, status = $2, subscription_plan = $3 WHERE id = $4 RETURNING *',
            [name, status, subscription_plan, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Tenant not found' });
        }

        res.status(200).json({ 
            success: true, 
            message: 'Tenant updated successfully', 
            data: result.rows[0] 
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// 5. Delete Tenant (Point #19)
exports.deleteTenant = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM tenants WHERE id = $1 RETURNING *', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Tenant not found' });
        }

        res.status(200).json({ 
            success: true, 
            message: 'Tenant deleted successfully' 
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};