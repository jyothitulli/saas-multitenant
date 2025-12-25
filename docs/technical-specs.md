Technical Specification: SaaS Multi-tenant Platform1. Project StructureThe project is organized to support clear separation of concerns, ensuring the backend is scalable and the frontend is modular.📂 Backend StructurePlaintextbackend/
├── prisma/                 
│   ├── schema.prisma     
│   └── migrations/       
├── src/
│   ├── config/             # App configuration (Prisma, Passport, Cloudinary)
│   ├── controllers/        # Request handling logic
│   ├── middleware/         # Auth & Tenant-detection (Tenant isolation)
│   ├── models/             # Business logic & Data access wrappers
│   ├── routes/             # API endpoint definitions
│   ├── utils/              # Shared helper functions
│   └── server.js           # Server entry point & listener
├── tests/                  # Integration and Unit tests
├── .env                    # Environment variables (Local only)
├── package.json            # Scripts and dependencies
└── prisma.config.ts        # Prisma 7 global configuration
📂 Frontend StructurePlaintextfrontend/
├── public/                 # Static assets
├── src/
│   ├── assets/             # Global styles and images
│   ├── components/         # Atomic UI components (Button, Modal)
│   ├── features/           # Domain-driven modules (Billing, Dashboard)
│   ├── hooks/              # Custom React hooks (useAuth, useTenant)
│   ├── pages/              # View components mapped to routes
│   ├── services/           # API client (Axios/React Query)
│   ├── store/              # State management (Zustand/Redux)
│   └── utils/              # Form validation and date helpers
├── .env                    # Frontend environment variables
└── package.json            # Scripts and dependencies
 Major Folder DescriptionsFolderPurposemiddleware/Handles "Gatekeeping" (JWT verification, checking if a user has access to a specific tenant's data).features/(Frontend) Groups logic by feature rather than type, making the SaaS easier to maintain as it grows.config/Centralizes external service initializations to keep server.js clean.2. Development Setup Guide🛠 PrerequisitesNode.js: v22.17.0 (LTS)Database: PostgreSQL 15+Tools: Prisma CLI, Git🌐 Environment VariablesCreate a .env file in the backend/ directory with the following:Code snippetPORT=5000
DATABASE_URL="postgresql://<user>:<password>@localhost:5432/<db_name>?schema=public"
JWT_SECRET="generate_a_long_random_string"
NODE_ENV="development"
 Installation StepsClone & Install:PowerShellgit clone <your-repo-url>
cd saas-multitenant/backend
npm install
Initialize Database:PowerShellnpx prisma generate
npx prisma migrate dev --name init
How to Run LocallyDevelopment Mode: npm run dev (Uses Node/Nodemon for hot-reloading)Production Mode: npm start (Optimized execution)🧪 How to Run TestsPowerShellnpm test