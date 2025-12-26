// // prisma.config.js
// // import { defineConfig } from '@prisma/client';
// import dotenv from 'dotenv';
// dotenv.config();

// export default defineConfig({
//   client: {
//     adapter: 'prisma-postgresql',
//     url: process.env.DATABASE_URL,
//   },
// });
// prisma.config.js
import dotenv from 'dotenv';
dotenv.config();

export default {
  client: {
    adapter: 'prisma-postgresql',  // for PostgreSQL
    url: process.env.DATABASE_URL,  // your database URL
  },
};
