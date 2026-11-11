import { resolve } from "node:path";
import { config } from "dotenv";

export const NODE_ENV = process.env.NODE_ENV ?? "development";

config({ path: resolve(`./config/.env.${NODE_ENV}`) });

// GENERAL
export const PORT = parseInt(process.env.PORT ?? "4000");
export const APPLICATION_NAME = process.env.APPLICATION_NAME;
// development: WEBSITE_URL=http://localhost:  -> the port is added  -> http://localhost:4000/
// production:  WEBSITE_URL=https://your-app.vercel.app  -> no port  -> https://your-app.vercel.app/
export const WEBSITE_URL =
  NODE_ENV === "production"
    ? `${process.env.WEBSITE_URL}/`
    : `${process.env.WEBSITE_URL}${PORT}/`;

// DATABASE
const DB_URL = process.env.DB_URL_ATLAS;
const DB_NAME = process.env.DB_NAME || "Ghost_Messages";
export const DB_URI = `${DB_URL}/${DB_NAME}`;
export const DB_REDIS_URI = process.env.DB_REDIS_URI;

// security (Hashing , Encryption)
export const SALT_ROUND = parseInt(process.env.SALT_ROUND ?? "12");
export const ENC_KEY = process.env.ENC_KEY;
export const IV_LENGTH = parseInt(process.env.IV_LENGTH ?? "16");

// ACCESS TOKEN (USER , ADMIN)
export const ACCESS_ADMIN_TOKEN_SIGNATURE =
  process.env.ACCESS_ADMIN_TOKEN_SIGNATURE;
export const ACCESS_USER_TOKEN_SIGNATURE =
  process.env.ACCESS_USER_TOKEN_SIGNATURE;
export const ACCESS_TOKEN_EXPIRES_IN = parseInt(
  process.env.ACCESS_TOKEN_EXPIRES_IN ?? "1800",
);

// REFRESH TOKEN (USER , ADMIN)
export const REFRESH_ADMIN_TOKEN_SIGNATURE =
  process.env.REFRESH_ADMIN_TOKEN_SIGNATURE;
export const REFRESH_USER_TOKEN_SIGNATURE =
  process.env.REFRESH_USER_TOKEN_SIGNATURE;
export const REFRESH_TOKEN_EXPIRES_IN = parseInt(
  process.env.REFRESH_TOKEN_EXPIRES_IN ?? "31536000",
);

// GOOGLE ACCOUNT
export const WEB_CLIENT_IDS = process.env.WEB_CLIENT_IDS?.split(",") ?? [];

// SEND EMAIL
export const APP_PASSWORD = process.env.APP_PASSWORD;
export const APP_EMAIL = process.env.APP_EMAIL;
export const FACEBOOK = process.env.FACEBOOK;
export const TWITTER = process.env.TWITTER;
export const INSTAGRAM = process.env.INSTAGRAM;
export const OTP_EXPIRES_TIME = parseInt(process.env.OTP_EXPIRES_TIME ?? "120");
export const BLOCK_OTP_TIME = parseInt(process.env.BLOCK_OTP_TIME ?? "300");
export const MAX_OTP_TRIALS = parseInt(process.env.MAX_OTP_TRIALS ?? "3");
export const MAX_OTP_ATTEMPTS = parseInt(process.env.MAX_OTP_ATTEMPTS ?? "5");

// LOGIN
export const MAX_INCORRECT_PASSWORD_ATTEMPTS = parseInt(
  process.env.MAX_INCORRECT_PASSWORD_ATTEMPTS ?? "5",
);

// PAGINATION
export const PAGINATION_LIMIT = parseInt(process.env.PAGINATION_LIMIT ?? "5");
export const PAGE = parseInt(process.env.PAGE ?? "1");

// CORS
export const ORIGINS = process.env.ORIGINS?.split(",") ?? [];

// CACHING
export const USER_PROFILE_CACHE_TTL = parseInt(
  process.env.USER_PROFILE_CACHE_TTL ?? "86400",
);

// CLOUDINARY
export const CLOUD_NAME = process.env.CLOUD_NAME;
export const CLOUD_API_KEY = process.env.CLOUD_API_KEY;
export const CLOUD_API_SECRET = process.env.CLOUD_API_SECRET;

// RESET PASSWORD LINK
export const FRONTEND_URL = process.env.FRONTEND_URL;
export const RESET_PASSWORD_LINK_EXPIRES_TIME = parseInt(
  process.env.RESET_PASSWORD_LINK_EXPIRES_TIME ?? "300",
);

export default {
  NODE_ENV,
  PORT,
  APPLICATION_NAME,
  WEBSITE_URL,
  DB_URI,
  DB_REDIS_URI,
  SALT_ROUND,
  ENC_KEY,
  IV_LENGTH,
  ACCESS_ADMIN_TOKEN_SIGNATURE,
  ACCESS_USER_TOKEN_SIGNATURE,
  ACCESS_TOKEN_EXPIRES_IN,
  REFRESH_ADMIN_TOKEN_SIGNATURE,
  REFRESH_USER_TOKEN_SIGNATURE,
  REFRESH_TOKEN_EXPIRES_IN,
  WEB_CLIENT_IDS,
  APP_PASSWORD,
  APP_EMAIL,
  FACEBOOK,
  TWITTER,
  INSTAGRAM,
  OTP_EXPIRES_TIME,
  BLOCK_OTP_TIME,
  MAX_OTP_TRIALS,
  MAX_OTP_ATTEMPTS,
  MAX_INCORRECT_PASSWORD_ATTEMPTS,
  PAGINATION_LIMIT,
  PAGE,
  ORIGINS,
  USER_PROFILE_CACHE_TTL,
  CLOUD_NAME,
  CLOUD_API_KEY,
  CLOUD_API_SECRET,
  FRONTEND_URL,
  RESET_PASSWORD_LINK_EXPIRES_TIME,
};
