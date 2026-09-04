# Store Rating Platform

A full-stack web application that allows users to submit ratings for stores registered on the platform. Built with ReactJS, ExpressJS, Node.js, and PostgreSQL.

## Features

- **Three User Roles**: System Administrator, Normal User, Store Owner
- **JWT Authentication**: Secure token-based authentication for all roles
- **Role-Based Authorization**: Each role has restricted access to specific functionality
- **Store Ratings**: Users can submit and modify ratings (1-5) for stores
- **Search & Filter**: Full-text search and filtering on store/user listings
- **Sorting**: Ascending/descending sorting on all table columns
- **Form Validation**: Both frontend and backend validation with clear error messages
- **Responsive UI**: Clean, professional interface that works on all screen sizes

## Tech Stack

| Layer     | Technology                    |
|-----------|-------------------------------|
| Frontend  | React 19, React Router, Axios |
| Backend   | Express.js, Node.js           |
| Database  | PostgreSQL                    |
| Auth      | JWT (jsonwebtoken), bcryptjs  |
| Build     | Vite                          |

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    React Frontend                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────────┐   │
│  │ Auth Pages│  │ Admin    │  │ User / Owner Pages   │   │
│  │ Login     │  │ Dashboard│  │ Store Listing        │   │
│  │ Signup    │  │ Users    │  │ Rating               │   │
│  │ Change PW │  │ Stores   │  │ Dashboard            │   │
│  └──────────┘  └──────────┘  └──────────────────────┘   │
│         │              │              │                   │
│         └──────────────┼──────────────┘                   │
│                        │ Axios (REST API)                 │
├────────────────────────┼─────────────────────────────────┤
│                    Express Backend                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐               │
│  │ Auth     │  │ Admin    │  │ Store    │               │
│  │ Routes   │  │ Routes   │  │ Routes   │               │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘               │
│       │              │              │                     │
│  ┌────▼──────────────▼──────────────▼─────┐              │
│  │        Controllers → Services          │              │
│  └────────────────┬───────────────────────┘              │
│                   │                                      │
│  ┌────────────────▼───────────────────────┐              │
│  │    Middleware: Auth, Validate, Error    │              │
│  └────────────────┬───────────────────────┘              │
│                   │                                      │
├───────────────────┼──────────────────────────────────────┤
│              PostgreSQL Database                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐               │
│  │  users   │  │  stores  │  │ ratings  │               │
│  └──────────┘  └──────────┘  └──────────┘               │
└─────────────────────────────────────────────────────────┘
```

## Database Schema

### users
| Column        | Type         | Constraints                        |
|---------------|--------------|------------------------------------|
| id            | SERIAL       | PRIMARY KEY                        |
| name          | VARCHAR(60)  | NOT NULL                           |
| email         | VARCHAR(255) | NOT NULL, UNIQUE                   |
| password_hash | VARCHAR(255) | NOT NULL                           |
| address       | VARCHAR(400) | NOT NULL                           |
| role          | ENUM         | NOT NULL (admin/normal/store_owner)|
| created_at    | TIMESTAMP    | DEFAULT CURRENT_TIMESTAMP          |
| updated_at    | TIMESTAMP    | DEFAULT CURRENT_TIMESTAMP          |

### stores
| Column    | Type         | Constraints           |
|-----------|--------------|-----------------------|
| id        | SERIAL       | PRIMARY KEY           |
| name      | VARCHAR(60)  | NOT NULL              |
| email     | VARCHAR(255) | NOT NULL, UNIQUE      |
| address   | VARCHAR(400) | NOT NULL              |
| owner_id  | INTEGER      | FK → users(id)        |

### ratings
| Column    | Type      | Constraints                          |
|-----------|-----------|--------------------------------------|
| id        | SERIAL    | PRIMARY KEY                          |
| user_id   | INTEGER   | NOT NULL, FK → users(id)             |
| store_id  | INTEGER   | NOT NULL, FK → stores(id)            |
| rating    | INTEGER   | NOT NULL, CHECK (1-5)                |

**Unique constraint**: `(user_id, store_id)` — one rating per user per store.

### Indexes
- `idx_users_email`, `idx_users_role`, `idx_users_name`
- `idx_stores_name`, `idx_stores_owner`
- `idx_ratings_user`, `idx_ratings_store`, `idx_ratings_store_rating`

## User Roles

### System Administrator
- View dashboard with total users, stores, and ratings
- Create new users (normal or admin)
- Create new stores
- List and filter users by name/email/address/role
- List and filter stores by name/email/address
- View detailed user info (including store rating for store owners)

### Normal User
- Sign up for an account
- Browse all registered stores
- Search stores by name or address
- Submit ratings (1-5) for stores
- Modify existing ratings
- Change password

### Store Owner
- View dashboard with average rating and total ratings
- See list of users who rated their store
- Change password
- Cannot access other owners' data

## Authentication Flow

1. User submits credentials via login form
2. Backend validates credentials against bcrypt-hashed password
3. JWT token is generated with `userId` and `role` claims
4. Token is stored in `localStorage` on the client
5. All API requests include `Authorization: Bearer <token>` header
6. Auth middleware verifies token and attaches user to request
7. Role-based middleware checks user role before route handlers

## API Overview

### Auth
| Method | Endpoint                  | Description              | Auth     |
|--------|---------------------------|--------------------------|----------|
| POST   | /api/auth/signup          | Register normal user     | Public   |
| POST   | /api/auth/login           | Login (all roles)        | Public   |
| GET    | /api/auth/me              | Get current user         | Required |
| POST   | /api/auth/change-password | Change password          | Required |

### Admin
| Method | Endpoint                  | Description              | Auth     |
|--------|---------------------------|--------------------------|----------|
| GET    | /api/admin/dashboard      | Dashboard stats          | Admin    |
| POST   | /api/admin/users          | Create user              | Admin    |
| POST   | /api/admin/stores         | Create store             | Admin    |
| GET    | /api/admin/users          | List users (filter/sort) | Admin    |
| GET    | /api/admin/users/:id      | User details             | Admin    |
| GET    | /api/admin/stores         | List stores (filter/sort)| Admin    |

### Stores (Normal User)
| Method | Endpoint                  | Description              | Auth     |
|--------|---------------------------|--------------------------|----------|
| GET    | /api/stores               | Search/browse stores     | Normal   |
| POST   | /api/stores/rate          | Submit/update rating     | Normal   |
| PUT    | /api/stores/:storeId/rate | Update rating            | Normal   |
| GET    | /api/stores/:storeId/my-rating | Get user's rating  | Normal   |

### Store Owner
| Method | Endpoint                      | Description          | Auth       |
|--------|-------------------------------|----------------------|------------|
| GET    | /api/store-owner/dashboard    | Dashboard data       | Store Owner|

## Project Folder Structure

```
├── README.md
├── backend/
│   ├── .env
│   ├── package.json
│   ├── src/
│   │   ├── index.js                 # Express server entry point
│   │   ├── config/
│   │   │   └── index.js             # Configuration (env vars)
│   │   ├── db/
│   │   │   ├── pool.js              # PostgreSQL connection pool
│   │   │   ├── init.js              # Schema initialization
│   │   │   ├── seed.js              # Database seeding
│   │   │   └── reset.js             # Database reset
│   │   ├── middleware/
│   │   │   ├── auth.js              # JWT auth + role authorization
│   │   │   └── errorHandler.js      # Centralized error handling
│   │   ├── routes/
│   │   │   ├── auth.js              # Auth routes
│   │   │   ├── admin.js             # Admin routes
│   │   │   ├── stores.js            # Store/rating routes
│   │   │   └── storeOwner.js        # Store owner routes
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── adminController.js
│   │   │   ├── storeController.js
│   │   │   └── storeOwnerController.js
│   │   ├── services/
│   │   │   ├── authService.js
│   │   │   ├── userService.js
│   │   │   ├── storeService.js
│   │   │   └── ratingService.js
│   │   └── validators/
│   │       ├── auth.js
│   │       ├── user.js
│   │       ├── store.js
│   │       └── rating.js
│   ├── test.js                      # API test script
│   └── start-test.js                # Server + test runner
└── frontend/
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── main.jsx                 # React entry point
        ├── App.jsx                  # Main app with routes
        ├── api/
        │   ├── axios.js             # Axios instance + interceptors
        │   ├── auth.js
        │   ├── admin.js
        │   ├── stores.js
        │   └── storeOwner.js
        ├── context/
        │   └── AuthContext.jsx       # Authentication state management
        ├── components/
        │   ├── ProtectedRoute.jsx    # Route protection wrapper
        │   ├── Navbar.jsx           # Navigation bar
        │   ├── DataTable.jsx        # Reusable sortable table
        │   ├── RatingStars.jsx      # Star rating component
        │   ├── Loading.jsx          # Loading spinner
        │   └── Message.jsx          # Success/error messages
        ├── pages/
        │   ├── Login.jsx
        │   ├── Signup.jsx
        │   ├── ChangePassword.jsx
        │   ├── admin/
        │   │   ├── Dashboard.jsx
        │   │   ├── UsersManagement.jsx
        │   │   ├── UserDetails.jsx
        │   │   └── StoresManagement.jsx
        │   ├── user/
        │   │   └── StoreListing.jsx
        │   └── owner/
        │       └── Dashboard.jsx
        └── styles/
            └── App.css              # Global styles
```

## Environment Variables

### Backend (.env)
```
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=store_rating
DB_USER=postgres
DB_PASSWORD=
JWT_SECRET=your_secret_key_here
JWT_EXPIRES_IN=24h
NODE_ENV=development
```

## Database Setup

### Prerequisites
- PostgreSQL installed and running
- Node.js v18+ installed

### Steps
1. Create the database:
```sql
CREATE DATABASE store_rating;
```

2. Update the `.env` file with your PostgreSQL credentials.

3. Seed the database with sample data:
```bash
cd backend
npm run seed
```

## Installation

### Backend
```bash
cd backend
npm install
```

### Frontend
```bash
cd frontend
npm install
```

## Running the Application

### Start Backend
```bash
cd backend
npm run dev     # Development with hot-reload
# or
npm start       # Production
```
Backend runs on `http://localhost:5000`

### Start Frontend
```bash
cd frontend
npm run dev     # Development server
```
Frontend runs on `http://localhost:3000` with API proxy to backend.

### Build for Production
```bash
cd frontend
npm run build   # Output in frontend/dist/
```

## How to Seed Database
```bash
cd backend
npm run seed
```

This creates sample users, stores, and ratings for testing.

## Testing

### Run API Tests
```bash
cd backend
node start-test.js
```

### Manual Testing Checklist
1. Login as admin → verify dashboard shows correct counts
2. Login as normal user → verify store listing and rating
3. Login as store owner → verify dashboard shows raters
4. Test role restrictions (normal user cannot access admin routes)
5. Test form validations (short name, weak password, etc.)
6. Test search and filtering on stores and users
7. Test sorting on all tables
8. Test rating submission and modification

## Test Credentials

| Role         | Email                  | Password    |
|--------------|------------------------|-------------|
| Admin        | admin@example.com      | Admin@123   |
| Normal User  | john@example.com       | User@1234   |
| Store Owner  | bob@example.com        | Owner@123   |

## Form Validations

| Field    | Rules                                                     |
|----------|-----------------------------------------------------------|
| Name     | 20-60 characters                                          |
| Email    | Standard email format                                     |
| Password | 8-16 characters, 1 uppercase, 1 special character         |
| Address  | Max 400 characters                                        |
| Rating   | Integer between 1 and 5                                   |

## GitHub Setup

```bash
# Initialize git repository
git init

# Create .gitignore
echo "node_modules/
backend/node_modules/
frontend/node_modules/
frontend/dist/
.env
*.log" > .gitignore

# Add all files
git add .

# Commit
git commit -m "Initial commit: Store Rating Platform"

# Add remote and push
git remote add origin https://github.com/yourusername/store-rating-platform.git
git branch -M main
git push -u origin main
```

## Security Implementation

- **Password Hashing**: bcryptjs with 10 salt rounds
- **JWT Authentication**: Time-limited tokens (24h expiry)
- **Protected Routes**: Both frontend (React Router) and backend (middleware)
- **Role-Based Authorization**: Server-side checks on every API endpoint
- **Input Validation**: express-validator on backend, form validation on frontend
- **No Plain Text Passwords**: Passwords never stored or returned in API responses
- **Environment Variables**: Secrets and config in .env files

## License

MIT
