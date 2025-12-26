
const { pool } = require('../config/db');

/**
 * Logs important system actions to the audit_logs table
 * @param {string} tenantId - The ID of the tenant
 * @param {string} userId - The ID of the user performing the action
 * @param {string} action - Description of action (e.g., 'CREATE_PROJECT') [cite: 281]
 * @param {string} entityType - The type of entity (user, project, task) [cite: 282]
 * @param {string} entityId - The ID of the affected entity [cite: 283]
 */
exports.logAction = async (tenantId, userId, action, entityType, entityId) => {
    try {
        await pool.query(
            'INSERT INTO audit_logs (id, tenant_id, user_id, action, entity_type, entity_id) VALUES (gen_random_uuid(), $1, $2, $3, $4, $5)',
            [tenantId, userId, action, entityType, entityId]
        );
    } catch (err) {
        console.error('Audit Log Error:', err.message);
    }
};
