export const LAB_DATA = {
  "RESTful Task Tracker": {
    description:
      "Express.js RESTful API with MVC pattern, middleware, and error handling.",
    criteria: [
      {
        id: "setup",
        name: "Project Setup",
        description: "Express app runs correctly using .env variables",
        weight: 10,
      },
      {
        id: "routing",
        name: "Routing & Parameters",
        description:
          "CRUD routes implemented correctly and return proper status codes",
        weight: 20,
      },
      {
        id: "middleware",
        name: "Middleware Usage",
        description:
          "Proper use of logger, parser, error handler, and 404 middleware",
        weight: 15,
      },
      {
        id: "errorhandling",
        name: "Error Handling",
        description: "Graceful handling of invalid routes and bad inputs",
        weight: 15,
      },
      {
        id: "mvc",
        name: "MVC Structure",
        description: "Logical and organized folder structure",
        weight: 15,
      },
      {
        id: "response",
        name: "Response Format",
        description: "Returns clean JSON and correct HTTP status codes",
        weight: 10,
      },
      {
        id: "codequality",
        name: "Code Quality & Clarity",
        description: "Code readability, organization, and documentation",
        weight: 15,
      },
    ],
  },
  "Task Tracker - Database": {
    description:
      "Extends Task Tracker with persistent database storage, models, and async operations.",
    criteria: [
      {
        id: "dbsetup",
        name: "Database Setup & Connection",
        description: "Successfully connects to a database",
        weight: 15,
      },
      {
        id: "datamodel",
        name: "Data Model / Schema",
        description: "Properly structured model with validation",
        weight: 15,
      },
      {
        id: "crud",
        name: "CRUD Integration",
        description: "Routes correctly interact with the database",
        weight: 25,
      },
      {
        id: "async",
        name: "Async/Await & Error Handling",
        description: "Correct handling of async operations and errors",
        weight: 15,
      },
      {
        id: "envconfig",
        name: "Environment Configuration",
        description: "Secure management of environment variables",
        weight: 10,
      },
      {
        id: "responsq",
        name: "Response Quality",
        description: "Proper HTTP status codes and consistent JSON output",
        weight: 10,
      },
      {
        id: "codeorg",
        name: "Code Organization & Clarity",
        description: "Follows MVC and readable structure",
        weight: 10,
      },
    ],
  },
  "Task Tracker with Auth": {
    description:
      "Secures the Task Tracker API with JWT authentication and role-based access control.",
    criteria: [
      {
        id: "authreglogin",
        name: "User Registration & Login",
        description: "Implements secure signup and login with bcrypt hashing",
        weight: 20,
      },
      {
        id: "jwt",
        name: "JWT Authentication",
        description: "Correctly issues, verifies, and expires JWT tokens",
        weight: 20,
      },
      {
        id: "protected",
        name: "Protected Routes",
        description:
          "Middleware correctly restricts access to authenticated users only",
        weight: 20,
      },
      {
        id: "rbac",
        name: "Role-Based Access Control",
        description:
          "Properly applies user roles (user/admin) to control access",
        weight: 15,
      },
      {
        id: "secerr",
        name: "Error Handling & Security",
        description:
          "Secure coding practices, environment variables, consistent error responses",
        weight: 15,
      },
      {
        id: "orgdoc",
        name: "Code Organization & Documentation",
        description:
          "Clean folder structure, clear naming, and concise documentation",
        weight: 10,
      },
    ],
  },
  "Media Library API": {
    description:
      "Production-grade API with layered architecture, file uploads, pagination, and error handling.",
    criteria: [
      {
        id: "layered",
        name: "Layered Architecture",
        description:
          "Clear separation across routes, controllers, services, repositories",
        weight: 20,
      },
      {
        id: "globalerr",
        name: "Global Error Handling",
        description:
          "Centralized error middleware, AppError class, process-level handlers",
        weight: 20,
      },
      {
        id: "validation",
        name: "Request Validation",
        description:
          "Joi/Zod schemas via reusable middleware with structured errors",
        weight: 15,
      },
      {
        id: "fileupload",
        name: "File Upload Handling",
        description:
          "Multer correctly configured; metadata persisted alongside file info",
        weight: 20,
      },
      {
        id: "pagination",
        name: "Pagination, Filtering & Search",
        description:
          "All query parameters function correctly with full pagination metadata",
        weight: 15,
      },
      {
        id: "asyncprom",
        name: "Async/Await & Promise Handling",
        description:
          "catchAsync in use, Promise.all() demonstrated, no unhandled rejections",
        weight: 10,
      },
    ],
  },
  "Testing, Deployment & Monitoring": {
    description:
      "Makes Media Library API production-ready with tests, CI/CD, Vercel deployment, and logging.",
    criteria: [
      {
        id: "postman",
        name: "Postman Collection",
        description:
          "All endpoints covered, env vars used, assertions present, collection committed",
        weight: 15,
      },
      {
        id: "unittests",
        name: "Unit Tests",
        description:
          "AppError, catchAsync, validate, and service logic tested correctly",
        weight: 20,
      },
      {
        id: "inttests",
        name: "Integration Tests",
        description:
          "All endpoints covered with Supertest; edge cases tested; test DB isolated",
        weight: 20,
      },
      {
        id: "envconf",
        name: "Environment Configuration",
        description:
          "Separate env files, startup validation, .env.example committed",
        weight: 15,
      },
      {
        id: "gitcicd",
        name: "Git Workflow & CI/CD",
        description:
          "Clean commit history, feature branch + PR workflow, GitHub Actions passes",
        weight: 15,
      },
      {
        id: "deploylog",
        name: "Deployment & Logging",
        description:
          "App live on Vercel, structured logging, /health endpoint responds",
        weight: 15,
      },
    ],
  },
  "Full-Stack Kanban Application": {
    description:
      "Full-stack Kanban board connecting Node.js/Express backend to an existing frontend.",
    criteria: [
      {
        id: "apidesign",
        name: "API Design & Structure",
        description:
          "Clear RESTful endpoints, modular code structure, separation of concerns",
        weight: 20,
      },
      {
        id: "dbmodel",
        name: "Database Modeling & Persistence",
        description:
          "Logical schema design, relationships (boards–columns–tasks), consistent persistence",
        weight: 20,
      },
      {
        id: "authz",
        name: "Authentication & Authorization",
        description:
          "Secure JWT implementation, role-based access control, hashed passwords",
        weight: 20,
      },
      {
        id: "features",
        name: "Functionality & Feature Completion",
        description:
          "All core CRUD operations working; collaboration features where possible",
        weight: 15,
      },
      {
        id: "frontend",
        name: "Frontend Integration",
        description:
          "Successful connection of frontend to backend APIs (data loads, updates, persists)",
        weight: 10,
      },
      {
        id: "codeqdoc",
        name: "Code Quality & Documentation",
        description:
          "Clean, readable code with meaningful names, comments, and setup guide",
        weight: 10,
      },
      {
        id: "bonus",
        name: "Bonus / Stretch Features",
        description:
          "Activity logs, notifications, real-time updates, or theme persistence",
        weight: 5,
      },
    ],
  },
};
