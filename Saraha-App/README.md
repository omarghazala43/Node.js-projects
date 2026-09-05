# Saraha App — Backend API

Anonymous messaging backend built with **Node.js**, **Express**, **MongoDB**, **Redis**, and **JWT authentication**. Users can register, confirm their email, log in (including Google OAuth), and send or receive anonymous messages with optional image attachments.

---

## Tech Stack

| Layer            | Technology                               |
| ---------------- | ---------------------------------------- |
| Runtime          | Node.js (ES Modules)                     |
| Framework        | Express 5                                |
| Database         | MongoDB + Mongoose                       |
| Cache / Sessions | Redis                                    |
| Auth             | JWT (access + refresh tokens)            |
| Validation       | Joi                                      |
| File Uploads     | Multer                                   |
| Email            | Nodemailer                               |
| Security         | Helmet, CORS, express-rate-limit, bcrypt |

---

## Features

- User registration with email OTP confirmation
- Login / logout (single device or all devices)
- JWT access & refresh token flow
- Password reset via OTP or email link
- Google OAuth login
- User profile management & profile image upload
- Anonymous messaging with image attachments
- Reply to received messages
- Role-based authorization (user / admin)
- Redis-backed OTP storage and token blacklisting

---

## Project Structure

```
src/
├── main.js                   # Entry point
├── bootstrap.js              # App setup & middleware
├── common/
│   ├── enums/                # Role, Gender, System enums
│   ├── response/             # Success & error handlers
│   ├── service/              # Redis service
│   ├── templates/            # Email HTML templates
│   └── utils/                # Hash, token, mail, multer helpers
├── DB/
│   ├── connection.js         # MongoDB connection
│   ├── redis.connection.js   # Redis connection
│   ├── repository.js         # Generic DB helpers
│   └── models/               # Mongoose schemas
├── middleware/
│   ├── auth.middleware.js    # JWT auth & role checks
│   └── validator.middleware.js
└── modules/
    ├── auth/                 # Authentication
    ├── user/                 # User profile
    └── messages/             # Messaging
```

---

## Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Redis (local or Upstash)
- Gmail account with App Password (for sending emails)
- Google Cloud OAuth credentials (optional, for Google login)

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Create your `.env` file

Create a `.env` file based on the provided `.env.example` file and fill in your environment-specific values.

### 3. Start the server

```bash
npm start
```

Server runs at `http://localhost:8000` by default.

---

## API Endpoints

### Health

| Method | Endpoint | Auth | Description  |
| ------ | -------- | ---- | ------------ |
| `GET`  | `/`      | No   | Health check |

### Auth — `/auth`

| Method  | Endpoint                           | Auth | Description                                       |
| ------- | ---------------------------------- | ---- | ------------------------------------------------- |
| `POST`  | `/auth/register`                   | No   | Register a new user                               |
| `POST`  | `/auth/login`                      | No   | Login and receive tokens                          |
| `PATCH` | `/auth/logout`                     | Yes  | Logout (`{ "flag": "all" }` logs out all devices) |
| `POST`  | `/auth/refresh-token`           | No   | Refresh access token                              |
| `PATCH` | `/auth/confirm-email`              | No   | Confirm email with OTP                            |
| `POST`  | `/auth/resend-otp`                 | No   | Resend confirmation OTP                           |
| `POST`  | `/auth/forget-password`            | No   | Send password reset OTP                           |
| `POST`  | `/auth/reset-password`             | No   | Reset password with OTP                           |
| `POST`  | `/auth/forget-password-link`       | No   | Send password reset link                          |
| `POST`  | `/auth/reset-password-link/:token` | No   | Reset password via link                           |
| `GET`   | `/auth/google`                     | No   | Redirect to Google OAuth                          |
| `GET`   | `/auth/google/callback`            | No   | Google OAuth callback                             |

### User — `/user`

| Method | Endpoint             | Auth  | Description              |
| ------ | -------------------- | ----- | ------------------------ |
| `GET`  | `/user/profile`      | Yes   | Get current user profile |
| `PUT`  | `/user/update-image` | Yes   | Update profile image     |
| `PUT`  | `/user/:userId`      | Admin | Update user (admin only) |

### Messages — `/user/messages`

| Method | Endpoint                          | Auth | Description                         |
| ------ | --------------------------------- | ---- | ----------------------------------- |
| `GET`  | `/user/messages/`                 | Yes  | Get all messages for logged-in user |
| `POST` | `/user/messages/send`             | Yes  | Send anonymous message              |
| `POST` | `/user/messages/:messageId/reply` | Yes  | Reply to a message                  |

**Auth header for protected routes:**

```
Authorization: Bearer <access_token>
```

---

## Postman Collection

A Postman collection is included in the `postman/` folder and contains
the available API endpoints for testing.

---

## Scripts

| Command     | Description                         |
| ----------- | ----------------------------------- |
| `npm start` | Start the server with file watching |

---

## Response Format

**Success:**

```json
{
  "message": "Done",
  "data": {}
}
```

**Validation error:**

```json
{
  "message": "validation error",
  "errors": []
}
```

**Application error:**

```json
{
  "message": "Error description"
}
```

---

## License

ISC
