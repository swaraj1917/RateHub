# ⭐ RateHub

> A full-stack store rating platform where customers can discover and rate stores, store owners can monitor customer feedback, and administrators can manage the entire platform.

Built for the **FullStack Intern Coding Challenge**.

**React** • **Express.js** • **PostgreSQL** • **Prisma** • **JWT**

---

## 🚀 Live Demo

**[Open RateHub](https://rate-hub-peach.vercel.app/login)**

> The application is deployed and available for live testing.

### 🔑 Demo Accounts

| Role | Email | Password |
| --- | --- | --- |
| 🛡️ Administrator | `admin@ratehub.local` | `Admin@123` |
| 🏪 Store Owner | `storeowner@ratehub.local` | `Owner@123` |

**Normal User:** Create an account using the **Sign Up** option.

---

## 📸 Overview

RateHub is a role-based store rating application with three types of users:

- 👤 **Normal User** — browse stores and submit ratings
- 🏪 **Store Owner** — monitor ratings and customers
- 🛡️ **Administrator** — manage users, stores, and platform data

All three roles use the same login system, with access controlled by role-based authorization.

---

## ✨ Features

### 👤 Normal User

- Create an account
- Secure login
- Browse available stores
- Search stores by name or address
- View overall store ratings
- View personal submitted rating
- Submit a rating from **1–5**
- Modify an existing rating
- Change password
- Logout

### 🏪 Store Owner

- Secure login
- View store information
- View average store rating
- View total number of users who rated the store
- View customers who rated the store
- View individual ratings
- View rating submission dates
- Change password
- Logout

### 🛡️ System Administrator

- View platform statistics
  - Total users
  - Total stores
  - Total ratings
- Create users
- Create administrators
- Create store owners
- Create stores
- Assign store owners to stores
- Search users
- Filter users by role
- Search stores
- Sort users and stores
- View detailed user information
- View store owner information
- Change password
- Logout

### 🔐 Authentication & Security

- JWT-based authentication
- Role-based authorization
- Protected frontend routes
- Protected backend API routes
- Password hashing using bcrypt
- Server-side validation using Zod
- Client-side form validation
- Database-level constraints
- Environment variables for sensitive configuration

### 🎨 UI / UX

- Responsive design
- Custom CSS design system
- Clean dashboard layouts
- Loading states
- Error states
- Success messages
- Empty states
- Responsive tables
- Mobile-friendly forms and dashboards

---

## 🛠️ Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React, Vite |
| Routing | React Router |
| HTTP Client | Axios |
| Styling | Custom CSS |
| Backend | Node.js, Express.js |
| Validation | Zod |
| Authentication | JWT |
| Password Security | bcryptjs |
| Database | PostgreSQL |
| ORM | Prisma |

---

## 📋 Validation Rules

| Field | Requirement |
| --- | --- |
| **Name** | 20–60 characters |
| **Address** | Maximum 400 characters |
| **Password** | 8–16 characters |
| **Password Security** | At least 1 uppercase + 1 special character |
| **Email** | Valid email format |
| **Rating** | Integer from 1–5 |

Validation is implemented on the backend and appropriate restrictions are also applied to the frontend forms.

---

## 🗄️ Database Design

RateHub uses three main models:

```text
┌──────────────────┐
│      User        │
├──────────────────┤
│ id               │
│ name             │
│ email            │
│ password         │
│ address          │
│ role             │
│ createdAt        │
│ updatedAt        │
└────────┬─────────┘
         │
         │ owns
         ▼
┌──────────────────┐
│      Store       │
├──────────────────┤
│ id               │
│ name             │
│ email            │
│ address          │
│ ownerId          │
│ createdAt        │
│ updatedAt        │
└────────┬─────────┘
         │
         │ receives
         ▼
┌──────────────────┐
│     Rating       │
├──────────────────┤
│ id               │
│ rating           │
│ userId           │
│ storeId          │
│ createdAt        │
│ updatedAt        │
└──────────────────┘
