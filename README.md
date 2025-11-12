# Academic Affairs Web Application

A comprehensive web application for managing academic affairs, including teaching activities, course management, and workload tracking.

## 📋 Table of Contents

- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [Default Credentials](#default-credentials)
- [Features](#features)
- [API Documentation](#api-documentation)

## 🛠 Technology Stack

### Backend
- **Framework**: NestJS with Fastify adapter
- **ORM**: Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcrypt

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Library**: Ant Design
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Routing**: React Router DOM

## 📁 Project Structure

```
academic-affairs/
├── backend/              # NestJS Backend
│   ├── src/
│   │   ├── modules/      # Feature modules
│   │   ├── prisma/       # Prisma service
│   │   ├── config/       # Configuration files
│   │   └── main.ts       # Application entry point
│   ├── prisma/
│   │   ├── schema.prisma # Database schema
│   │   └── seed.ts       # Database seeding
│   └── package.json
│
└── frontend/             # React Frontend
    ├── src/
    │   ├── components/   # React components
    │   ├── pages/        # Page components
    │   ├── services/     # API services
    │   ├── store/        # State management
    │   ├── styles/       # Global styles
    │   ├── config/       # Configuration
    │   └── types/        # TypeScript types
    └── package.json
```

## ✅ Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **PostgreSQL** (v13 or higher)

## 📦 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd academic-affairs
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

## 🗄 Database Setup

### 1. Create PostgreSQL Database

```bash
# Access PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE academic_affairs;

# Exit PostgreSQL
\q
```

### 2. Configure Environment Variables

Create a `.env` file in the `backend` directory:

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/academic_affairs?schema=public"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="30m"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-change-this-in-production"
JWT_REFRESH_EXPIRES_IN="7d"
JWT_REFRESH_EXPIRES_IN_REMEMBER_ME="30d"

# App
PORT=3000
NODE_ENV="development"
```

### 3. Run Database Migrations

```bash
cd backend

# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# Seed the database with default data
npx prisma db seed
```

### 4. Configure Frontend Environment

Create a `.env` file in the `frontend` directory:

```env
VITE_API_URL=http://localhost:3000/api
```

## 🚀 Running the Application

### Development Mode

#### 1. Start the Backend

```bash
cd backend
npm run start:dev
```

The backend will start on `http://localhost:3000`

#### 2. Start the Frontend

```bash
cd frontend
npm run dev
```

The frontend will start on `http://localhost:5173`

### Production Mode

#### Backend

```bash
cd backend
npm run build
npm run start:prod
```

#### Frontend

```bash
cd frontend
npm run build
# Serve the dist folder with your preferred static server
```

## 🔐 Default Credentials

After seeding the database, you can log in with:

- **Username**: `admin`
- **Password**: `admin123`

**⚠️ Important**: You will be required to change the password on first login.

## 🎯 Features

### Admin Features
- User management (create, edit, deactivate)
- Department management
- Teacher-Department assignment
- System configuration
- View all activities

### Department Head Features
- Course management
- Teacher assignment to courses
- Set teacher employment info and mandatory hours
- Validate teaching activities
- Department reports

### Teacher Features
- View assigned courses
- Create and submit teaching activities
- Track workload progress
- Manage profile

## 📚 API Documentation

### Authentication Endpoints

```
POST   /api/auth/login              # User login
POST   /api/auth/logout             # User logout
POST   /api/auth/refresh            # Refresh access token
POST   /api/auth/change-password    # Change password
GET    /api/auth/profile            # Get current user profile
```

### Main Endpoints

```
# Users (Admin)
GET    /api/users
POST   /api/users

# Departments (Admin)
GET    /api/departments
POST   /api/departments

# Courses (Dept Head)
GET    /api/courses
POST   /api/courses

# Teaching Activities (Teacher)
GET    /api/teaching-activities
POST   /api/teaching-activities
```

## 🎨 Customization

### University Branding

Edit `/frontend/src/config/branding.json`:

```json
{
  "universityName": "Your University Name",
  "universityLogo": "/assets/university-logo.png",
  "universityShortName": "YUN"
}
```

### Theme Colors

Edit `/frontend/src/styles/_variables.scss` to customize colors.

## 🔧 Development

### Generate Prisma Client

After modifying the Prisma schema:

```bash
cd backend
npx prisma generate
npx prisma migrate dev --name description_of_changes
```

### Database Management

```bash
# View database in Prisma Studio
npx prisma studio

# Reset database (⚠️ removes all data)
npx prisma migrate reset
```

## 📝 License

This project is licensed under the MIT License.

## 👥 Support

For issues and questions, please contact the development team.

---

**Built with ❤️ for Academic Excellence**
