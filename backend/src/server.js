
// // const express = require('express');
// // const cors = require('cors');
// // const db = require('./config/db'); // Your database config

// // const app = express(); // <--- THIS MUST BE FIRST

// // app.use(cors());
// // app.use(express.json());

// // // MANDATORY HEALTH CHECK (Requirement [cite: 97])
// // app.get('/api/health', async (req, res) => {
// //   try {
// //     await db.pool.query('SELECT 1');
// //     res.status(200).json({ 
// //       success: true, 
// //       message: "System status: Healthy", 
// //       database: "Connected" 
// //     });
// //   } catch (err) {
// //     res.status(500).json({ 
// //       success: false, 
// //       message: "System status: Unhealthy", 
// //       database: "Disconnected" 
// //     });
// //   }
// // });

// // // ... your other routes (auth, projects, etc) ...

// // const PORT = process.env.PORT || 5000;
// // app.listen(PORT, () => {
// //   console.log(`Server running on port ${PORT}`);
// // });
// // src/server.js
// import express from 'express';
// import dotenv from 'dotenv';
// import cors from 'cors';
// import { registerTenant } from './routes/tenant.routes.js'; // note the .js extension
// import { loginUser } from './routes/auth.routes.js';

// dotenv.config();

// const app = express();

// // Middleware
// app.use(cors());
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // Routes
// app.get('/', (req, res) => {
//   res.send('API is running...');
// });

// app.post('/register-tenant', registerTenant);
// app.post('/login', loginUser);

// // Start server
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { registerTenant } from './routes/tenant.routes.js';
import { authRouter } from './routes/auth.routes.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test route
app.get('/', (req, res) => res.send('API is running...'));

// API routes
app.post('/register-tenant', registerTenant);
app.post('/login', authRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
