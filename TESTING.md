# Testing Guide - Authentication Module

This guide will help you test the authentication module that has been implemented.

## Prerequisites

Before testing, make sure you have:

1. PostgreSQL installed and running
2. Database created and migrations run
3. Both backend and frontend running

## Setup Steps

### 1. Database Setup

```bash
# Create PostgreSQL database
createdb academic_affairs

# Or using psql
psql -U postgres
CREATE DATABASE academic_affairs;
\q
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies (if not already done)
npm install

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# Seed the database (creates admin user)
npx prisma db seed

# Start the backend server
npm run start:dev
```

You should see:
```
✅ Database connected successfully
🚀 Application is running on: http://localhost:3000
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies (if not already done)
npm install

# Start the development server
npm run dev
```

You should see:
```
VITE v5.x.x  ready in XXX ms

➜  Local:   http://localhost:5173/
```

## Testing the Authentication Flow

### Test 1: Login with Default Admin

1. Open your browser and navigate to `http://localhost:5173`
2. You should be redirected to the login page
3. Enter credentials:
   - **Username**: `admin`
   - **Password**: `admin123`
4. Click "Sign In"
5. You should see a warning: "You must change your password before continuing"
6. A modal will appear requiring you to change your password

**Expected Result**: Login successful, change password modal appears

### Test 2: Change Password (First-Time Login)

1. After logging in with default credentials, the change password modal appears
2. Fill in the form:
   - **Current Password**: `admin123`
   - **New Password**: `NewPassword123!` (or any password 6+ characters)
   - **Confirm New Password**: `NewPassword123!`
3. Click "Change Password"
4. You should be redirected to the dashboard

**Expected Result**: Password changed successfully, redirected to dashboard

### Test 3: Dashboard Access

1. After successful login and password change, you should see the dashboard
2. Verify the following information is displayed:
   - Your username
   - Role (Administrator)
   - User profile details
   - Account status

**Expected Result**: Dashboard displays user information correctly

### Test 4: Logout

1. On the dashboard, click the "Logout" button (red button in top-right)
2. You should be redirected to the login page
3. Try accessing `http://localhost:5173/dashboard` directly
4. You should be redirected back to login

**Expected Result**: Logout successful, cannot access protected routes

### Test 5: Login with New Password

1. On the login page, enter:
   - **Username**: `admin`
   - **Password**: `NewPassword123!` (the password you set)
2. Optionally check "Remember me"
3. Click "Sign In"
4. You should be logged in directly to the dashboard (no password change required)

**Expected Result**: Login successful with new password, no password change prompt

### Test 6: Remember Me Functionality

1. Login with "Remember me" checked
2. Close the browser completely
3. Open the browser again and navigate to `http://localhost:5173`
4. You should still be logged in

**Expected Result**: Session persists across browser restarts (for 30 days)

### Test 7: Invalid Credentials

1. Try logging in with incorrect credentials:
   - **Username**: `admin`
   - **Password**: `wrongpassword`
2. You should see an error message

**Expected Result**: Error message "Login failed. Please check your credentials."

### Test 8: Token Refresh

1. Login successfully
2. Wait for 31 minutes (access token expires after 30 minutes)
3. Try to perform an action that requires authentication
4. The token should automatically refresh

**Expected Result**: Token refreshes automatically, no interruption in service

### Test 9: Change Password While Logged In

1. Login successfully
2. Manually trigger the change password modal (feature coming soon)
3. Enter old and new passwords
4. Verify password change

**Expected Result**: Password changes successfully

## API Testing with cURL

You can also test the API endpoints directly using cURL:

### Login

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "login": "admin",
    "password": "admin123",
    "rememberMe": false
  }'
```

### Change Password

```bash
# First, get the access token from login response
# Then use it in the Authorization header

curl -X POST http://localhost:3000/auth/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "oldPassword": "admin123",
    "newPassword": "NewPassword123!"
  }'
```

### Get Profile

```bash
curl -X GET http://localhost:3000/auth/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Refresh Token

```bash
curl -X POST http://localhost:3000/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

### Logout

```bash
curl -X POST http://localhost:3000/auth/logout \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Testing with Prisma Studio

You can also view and modify database data using Prisma Studio:

```bash
cd backend
npx prisma studio
```

This will open a web interface at `http://localhost:5555` where you can:
- View all users
- Check user roles
- Verify user information
- See authentication-related data

## Common Issues and Solutions

### Issue 1: "Database connection failed"

**Solution**: Make sure PostgreSQL is running and the DATABASE_URL in `.env` is correct.

```bash
# Check if PostgreSQL is running
pg_isready

# Start PostgreSQL (varies by OS)
# macOS:
brew services start postgresql

# Linux:
sudo systemctl start postgresql

# Windows: Use Services or pg_ctl
```

### Issue 2: "Prisma Client not generated"

**Solution**: Generate the Prisma client:

```bash
cd backend
npx prisma generate
```

### Issue 3: "CORS Error"

**Solution**: Make sure the FRONTEND_URL in backend `.env` matches your frontend URL (default: `http://localhost:5173`)

### Issue 4: "Cannot find module errors"

**Solution**: Install dependencies:

```bash
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install
```

### Issue 5: Port Already in Use

**Solution**: Change the port in `.env` or kill the process using the port:

```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>
```

## Next Steps

After successful testing of the authentication module, the next features to implement are:

1. **Teacher Dashboard** - Full workload tracking and activity management
2. **Department Head Module** - Course and teacher management
3. **Admin Module** - User and department management
4. **Reporting** - Generate workload reports

## Need Help?

If you encounter any issues:

1. Check the browser console for errors (F12 → Console)
2. Check backend logs in the terminal
3. Verify database connection and data using Prisma Studio
4. Review the error messages carefully

Happy Testing! 🎉
