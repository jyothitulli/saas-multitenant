const { execSync } = require('child_process');

console.log("running database migrations...");
// Replace these with your actual migration/seed commands (e.g., sequelize-cli or custom sql)
try {
  // Example: execSync('npx sequelize-cli db:migrate');
  // Example: execSync('npx sequelize-cli db:seed:all');
  console.log("Database initialized successfully!");
} catch (error) {
  console.error("Database initialization failed:", error.message);
  process.exit(1);
}