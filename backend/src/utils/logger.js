
const { pool } = require('../config/db');

exports.logAction = async (userId, action, entityType, entityId) => {
    await pool.query(
        'INSERT INTO audit_logs (user_id, action, entity_type, entity_id) VALUES ($1, $2, $3, $4)',
        [userId, action, entityType, entityId]
    );
};
