# 📅 Leave Track — Employee Leave Management System

A full-stack web application for managing employee leave requests, built with **Node.js + Express** on the backend and **React + Vite** on the frontend, powered by **MongoDB**.

---

## ✨ Features

- **Role-based access control** — three distinct roles: `employee`, `manager`, and `admin`
- **Leave requests** — submit, cancel, approve, or reject leave requests
- **Leave types** — Annual, Sick, Personal, Unpaid, and Other
- **Leave balance tracking** — each employee starts with 21 days
- **Team leave visibility** — managers and admins can view their team's leaves
- **JWT authentication** — secure token-based auth with bcrypt password hashing
- **Admin dashboard** — manage users, deactivate accounts, update roles
- **React SPA frontend** — served directly by the Express server in production

---

## 🛠️ Tech Stack

| Layer      | Technology                              |
|------------|-----------------------------------------|
| Backend    | Node.js, Express 5                      |
| Frontend   | React 19, React Router 7, Vite 8        |
| Database   | MongoDB (Mongoose 9)                    |
| Auth       | JSON Web Tokens (JWT), bcrypt           |
| Validation | Joi                                     |
| Dev Tools  | Nodemon, ESLint                         |

---

## 📁 Project Structure

```
node.react/
├── app.js                   # Express app entry point
├── package.json             # Backend dependencies
├── .env                     # Environment variables (not committed)
│
├── controllers/
│   ├── authController.js    # Register & login logic
│   ├── leaveControllers.js  # Leave CRUD & review logic
│   └── userControllers.js   # User management logic
│
├── middleware/
│   ├── auth.js              # JWT verification & role checking
│   └── logger.js            # Request logging
│
├── models/
│   ├── User.js              # User schema (role, leaveBalance, managerId)
│   └── LeaveRequest.js      # Leave request schema (type, status, dates)
│
├── routes/
│   ├── authRoutes.js        # POST /api/auth/register, /login
│   ├── leaveRoutes.js       # Leave CRUD routes
│   └── userRoutes.js        # User management routes
│
└── frontend/                # React + Vite frontend
    ├── src/
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── components/
    │       ├── Auth.jsx             # Login & register forms
    │       ├── EmployeeDashboard.jsx
    │       ├── ManagerDashboard.jsx
    │       ├── AdminDashboard.jsx
    │       ├── Header.jsx
    │       ├── Modal.jsx
    │       └── Toast.jsx
    └── dist/                # Built frontend (served by Express)
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [MongoDB](https://www.mongodb.com/) running locally on port `27017`

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd node.react
```

### 2. Install backend dependencies

```bash
npm install
```

### 3. Install frontend dependencies

```bash
cd frontend
npm install
cd ..
```

### 4. Configure environment variables

Create a `.env` file in the project root:

```env
JWT_SECRET=your_jwt_secret_here
```

### 5. Build the frontend

```bash
cd frontend
npm run build
cd ..
```

### 6. Start the server

```bash
# Production
npm start

# Development (with auto-restart)
npm run dev
```

The app will be available at **http://localhost:8000**

---

## 🌐 API Reference

### Auth — `/api/auth`

| Method | Endpoint    | Access  | Description         |
|--------|-------------|---------|---------------------|
| POST   | `/register` | Public  | Register a new user |
| POST   | `/login`    | Public  | Login and get a JWT |

### Leave Requests — `/api/leaves`

| Method | Endpoint       | Access            | Description                        |
|--------|----------------|-------------------|------------------------------------|
| POST   | `/submit`      | All (logged in)   | Submit a new leave request         |
| GET    | `/my-leaves`   | All (logged in)   | Get your own leave requests        |
| PATCH  | `/:id/cancel`  | All (logged in)   | Cancel a pending leave request     |
| POST   | `/review`      | Manager, Admin    | Approve or reject a leave request  |
| GET    | `/team`        | Manager, Admin    | View all team leave requests       |

### Users — `/api/users`

| Method | Endpoint          | Access | Description                |
|--------|-------------------|--------|----------------------------|
| GET    | `/`               | Admin  | List all users             |
| GET    | `/profile`        | All    | Get own profile            |
| PATCH  | `/profile`        | All    | Update own profile         |
| PATCH  | `/:id`            | Admin  | Update a user's details    |
| PATCH  | `/:id/deactivate` | Admin  | Deactivate a user account  |

---

## 👥 User Roles

| Role       | Permissions                                                        |
|------------|--------------------------------------------------------------------|
| `employee` | Submit & cancel own leaves, view own leave history                 |
| `manager`  | All employee permissions + review team leaves, view team calendar  |
| `admin`    | All permissions + manage users, assign roles, deactivate accounts  |

---

## 📋 Leave Types & Statuses

**Types:** `Annual` · `Sick` · `Personal` · `Unpaid` · `Other`

**Statuses:** `Pending` · `Approved` · `Rejected` · `Cancelled`

---

## 🔒 Authentication

All protected routes require a `Bearer` token in the `Authorization` header:

```
Authorization: Bearer <your_jwt_token>
```

Tokens are issued upon successful login and must be included with every API request to protected endpoints.

---

## 🗄️ Database

The app connects to a local MongoDB instance:

```
mongodb://127.0.0.1:27017/LeaveTrackDB
```

Make sure MongoDB is running before starting the server.

---

## 📜 License

This project is for educational purposes.
