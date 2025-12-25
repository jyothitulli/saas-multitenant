BEGIN;

INSERT INTO users (email, password_hash, role, tenant_id, created_at)
VALUES (
  'superadmin@system.com',
  '$2b$10$e0MYzXyjpJS7Pd0RVvHwHeFxL6X0VQ5WJY6n5z5yR3O6YxvYlGz8C',
  'super_admin',
  NULL,
  NOW()
);

INSERT INTO tenants (name, subdomain, status, plan, created_at)
VALUES (
  'Demo Company',
  'demo',
  'active',
  'pro',
  NOW()
);

-- Get tenant id
WITH demo_tenant AS (
  SELECT id FROM tenants WHERE subdomain = 'demo'
)

-- 3. TENANT ADMIN
INSERT INTO users (email, password_hash, role, tenant_id, created_at)
SELECT
  'admin@demo.com',
  '$2b$10$yH2U1p7D6jV2QFf8H5z6Ye3Xx9o3bY0VnqFJc4Y4xFz2D1qZyX5aK',
  'tenant_admin',
  id,
  NOW()
FROM demo_tenant;

-- 4. REGULAR USERS
INSERT INTO users (email, password_hash, role, tenant_id, created_at)
SELECT
  'user1@demo.com',
  '$2b$10$9Xy7UjZr9pZVQ5J5nR7X0e9XH9xJZ8R9XWZJQyY6sYkZ6sRz6cK',
  'user',
  id,
  NOW()
FROM demo_tenant;

INSERT INTO users (email, password_hash, role, tenant_id, created_at)
SELECT
  'user2@demo.com',
  '$2b$10$9Xy7UjZr9pZVQ5J5nR7X0e9XH9xJZ8R9XWZJQyY6sYkZ6sRz6cK',
  'user',
  id,
  NOW()
FROM demo_tenant;

-- --------------------------------------------------
-- 5. PROJECTS
-- --------------------------------------------------
INSERT INTO projects (name, tenant_id, created_at)
SELECT 'Website Revamp', id, NOW()
FROM tenants WHERE subdomain = 'demo';

INSERT INTO projects (name, tenant_id, created_at)
SELECT 'Mobile App Launch', id, NOW()
FROM tenants WHERE subdomain = 'demo';

-- --------------------------------------------------
-- 6. TASKS (5 TOTAL, DISTRIBUTED)
-- --------------------------------------------------
WITH demo_projects AS (
  SELECT p.id, p.name, p.tenant_id
  FROM projects p
  JOIN tenants t ON t.id = p.tenant_id
  WHERE t.subdomain = 'demo'
)
INSERT INTO tasks (title, status, project_id, tenant_id, created_at)
VALUES
  ('Design landing page', 'todo',
   (SELECT id FROM demo_projects WHERE name = 'Website Revamp'),
   (SELECT tenant_id FROM demo_projects LIMIT 1),
   NOW()),

  ('Implement authentication', 'in_progress',
   (SELECT id FROM demo_projects WHERE name = 'Website Revamp'),
   (SELECT tenant_id FROM demo_projects LIMIT 1),
   NOW()),

  ('Set up CI/CD', 'todo',
   (SELECT id FROM demo_projects WHERE name = 'Website Revamp'),
   (SELECT tenant_id FROM demo_projects LIMIT 1),
   NOW()),

  ('Create onboarding flow', 'todo',
   (SELECT id FROM demo_projects WHERE name = 'Mobile App Launch'),
   (SELECT tenant_id FROM demo_projects LIMIT 1),
   NOW()),

  ('Publish app to store', 'pending_review',
   (SELECT id FROM demo_projects WHERE name = 'Mobile App Launch'),
   (SELECT tenant_id FROM demo_projects LIMIT 1),
   NOW());

COMMIT;
