# Ghost Messages: API

REST API for **Ghost Messages**, an anonymous messaging app. Share your link, receive messages with no name attached, and if a sender wrote with their account, ask them to talk. They decide whether to accept.

Built with **Node.js, Express 5, MongoDB (Mongoose), Redis and Cloudinary**. Every response, validation error and email is available in **Arabic and English**.

| | |
|---|---|
| Live app | _link coming soon_ |
| Web client (React) | _link coming soon_ |
| Demo video | _link coming soon_ |

## Features

**Messaging**
- Public profile link: anyone can send a message, with or without an account.
- Anonymous or named messages, with image / PDF attachments.
- The receiver can ask a named sender to chat. The sender accepts or declines.
- Conversations with text and image attachments once a request is accepted.

**Accounts**
- Sign up with email verification by OTP, or sign in with Google.
- Optional two-step login: a code by email at every login.
- Forgot password by code, or by a one-time email link.
- Profile photo and up to 5 cover images, stored on Cloudinary.
- Admin role: list users, archive / restore accounts, delete archived accounts.

**Security**
- JWT access and refresh tokens, separate signatures for users and admins, automatic token rotation.
- Log out on this device or on all devices: revoked tokens are rejected on every request (Redis).
- Login brute-force protection: 5 failed attempts per 5 minutes per IP and route, reset on success.
- Global rate limiting backed by Redis.
- Passwords hashed with Argon2 (bcrypt supported). Phone numbers encrypted with AES-256-CBC.
- OTP codes stored hashed, with expiry, attempt limits and temporary blocking.
- Uploads checked by their real file type, not the extension.
- Request validation with Zod, errors returned per field.
- Helmet, CORS and centralized error handling.

**Platform**
- Bilingual responses: send `accept-language: 0` (Arabic) or `1` (English).
- HTML email templates in both languages (OTP, two-step code, reset link, new-user notification).
- User profiles cached in Redis, refreshed when the profile changes through the API.

## Tech stack

| Area | Tools |
|---|---|
| Runtime | Node.js 24, Express 5, ES modules |
| Database | MongoDB with Mongoose 9 |
| Cache, rate limits, OTP, revoked tokens | Redis |
| Files | Multer, Cloudinary, file-type |
| Auth | jsonwebtoken, google-auth-library, argon2, bcrypt |
| Validation | Zod 4 |
| Email | Nodemailer |
| Security | Helmet, express-rate-limit, CORS |

## Project structure

```
src/
├─ main.js                 app setup, middleware, routes
├─ modules/                one folder per feature: controller · service · validation
│  ├─ auth/
│  ├─ user/
│  ├─ message/
│  ├─ request/
│  └─ conversation/
├─ middleware/             authentication · authorization · validation · language · multer · errors
├─ common/
│  ├─ security/            token · hash · encryption
│  ├─ services/            Redis cache
│  ├─ translate/           ar.json · en.json
│  ├─ events/              email events
│  ├─ enum/
│  ├─ exceptions/
│  └─ utils/               cloudinary · email (templates) · multer · limiter
└─ DB/                     models · repository · connection · redis.connection
config/
├─ config.service.js       reads the environment
└─ .env.example            every variable the app needs
```

## API

All responses share one shape:

```json
{ "status_code": 200, "message": "Localized message", "data": {} }
```

Send the access token as `authorization: <token>` and the language as `accept-language: 0 | 1`.

### Auth: `/auth`

| Method | Path | Access | Purpose |
|---|---|---|---|
| POST | `/signup` | public | Create an account, sends an OTP |
| PATCH | `/confirm-email` | public | Confirm the email with the OTP |
| PATCH | `/resend-confirm-email` | public, rate-limited | Send a new OTP |
| POST | `/signup-with-gmail` | public | Sign up / log in with Google |
| POST | `/login` | public, rate-limited | Log in (asks for a code when two-step is on) |
| PATCH | `/login-confirmation` | public | Finish a two-step login |
| POST | `/enable-two-step-verification` | user | Send a code to turn two-step on |
| PATCH | `/confirm-two-step-verification` | user | Confirm the code |
| POST | `/request-forgot-password-code` | public | Email a reset code |
| POST | `/verify-forgot-password-code` | public | Check the reset code |
| PATCH | `/reset-password` | public | Reset with the code |
| POST | `/forgot-password` | public | Email a one-time reset link |
| PATCH | `/reset-password/:token` | public | Reset with the link token |
| POST | `/rotate-token` | refresh token | New access and refresh tokens |
| POST | `/logout` | user | Log out this device or all devices |

### Users: `/user`

| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | `/profile` | user | Current profile |
| PATCH | `/update` | user | Update profile data |
| GET | `/:userId/share-profile` | public | Public profile behind a share link |
| PATCH | `/profile-image` | user | Upload a profile photo |
| DELETE | `/profile-image` | user | Remove the profile photo |
| PATCH | `/cover-images` | user | Upload cover images (replaces the old ones) |
| GET | `/all` | admin | List users (active / archived / all) |
| PATCH | `/:userId/status` | admin | Archive or restore an account |
| DELETE | `/:userId` | admin | Delete an archived account and its images |

### Messages: `/message`

| Method | Path | Access | Purpose |
|---|---|---|---|
| POST | `/` | public or user | Send a message, anonymous or named, with attachments |
| GET | `/all` | user | Received / sent messages, paginated |
| GET | `/:messageId` | user | One message |
| DELETE | `/:messageId` | user | Delete a message and its attachments |

### Requests and conversations

| Method | Path | Access | Purpose |
|---|---|---|---|
| POST | `/request/create` | user | Ask the sender of a named message to chat |
| GET | `/request/all` | user | Requests by status |
| POST | `/request/action` | user | Accept or decline a request |
| POST | `/conversation/create` | user | Send a chat message, with attachments |
| GET | `/conversation/all` | user | The chat of a message |

## Getting started

Requirements: Node.js 24, a MongoDB database, a Redis instance, a Cloudinary account and an email account for sending (for Gmail, an app password).

```bash
npm install
cp config/.env.example config/.env.development   # then fill in the values
npm run start:dev
```

`config/.env.example` lists every variable:

| Group | Variables |
|---|---|
| App | `PORT`, `APPLICATION_NAME`, `WEBSITE_URL`, `FRONTEND_URL`, `ORIGINS` |
| Database | `DB_URL_ATLAS`, `DB_NAME`, `DB_REDIS_URI` |
| Security | `SALT_ROUND`, `ENC_KEY`, `IV_LENGTH` |
| Tokens | `ACCESS_USER_TOKEN_SIGNATURE`, `ACCESS_ADMIN_TOKEN_SIGNATURE`, `REFRESH_USER_TOKEN_SIGNATURE`, `REFRESH_ADMIN_TOKEN_SIGNATURE`, `ACCESS_TOKEN_EXPIRES_IN`, `REFRESH_TOKEN_EXPIRES_IN` |
| Google sign-in | `WEB_CLIENT_IDS` |
| Email | `APP_EMAIL`, `APP_PASSWORD`, `FACEBOOK`, `TWITTER`, `INSTAGRAM` |
| OTP and limits | `OTP_EXPIRES_TIME`, `BLOCK_OTP_TIME`, `MAX_OTP_TRIALS`, `MAX_OTP_ATTEMPTS`, `MAX_INCORRECT_PASSWORD_ATTEMPTS` |
| Reset link | `RESET_PASSWORD_LINK_EXPIRES_TIME` |
| Pagination and cache | `PAGINATION_LIMIT`, `PAGE`, `USER_PROFILE_CACHE_TTL` |
| Cloudinary | `CLOUD_NAME`, `CLOUD_API_KEY`, `CLOUD_API_SECRET` |

Never commit the real `.env` files: `.gitignore` already excludes them.

## Deployment

The app is exported from `src/main.js` and deployed on **Vercel** as a serverless function (`vercel.json` routes every path to it), with MongoDB Atlas and a hosted Redis. Set the same variables in the Vercel project settings.

For a regular server, uncomment `app.listen` in `src/DB/connection.db.js` and use `npm run start:prod` (PM2 in cluster mode).

## Author

**Antonious Nasr**, backend developer · [antoniousnasr3@gmail.com](mailto:antoniousnasr3@gmail.com)
