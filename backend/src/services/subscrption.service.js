import pool from '../config/db.js';

/**
 * Check whether tenant can create more projects
 */
export const checkProjectLimit = async (tenantId) => {
  const tenantResult = await pool.query(
    'SELECT subscription_plan, max_projects FROM tenants WHERE id = $1',
    [tenantId]
  );

  if (tenantResult.rows.length === 0) {
    throw new Error('Tenant not found');
  }

  const projectCountResult = await pool.query(
    'SELECT COUNT(*) FROM projects WHERE tenant_id = $1',
    [tenantId]
  );

  const maxProjects = tenantResult.rows[0].max_projects;
  const currentProjects = parseInt(
    projectCountResult.rows[0].count,
    10
  );

  if (currentProjects >= maxProjects) {
    throw new Error(
      `Project limit reached for ${tenantResult.rows[0].subscription_plan} plan`
    );
  }

  return true;
};
