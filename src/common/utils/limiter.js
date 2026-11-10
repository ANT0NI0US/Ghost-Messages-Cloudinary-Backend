import { ipKeyGenerator, rateLimit } from "express-rate-limit";
// import axios from "axios";
import geoip from "geoip-lite";
import { client } from "../../DB/redis.connection.js";
import { sResponse } from "./index.js";
import configService from "../../../config/config.service.js";

/*
* using ipapi
async function fromWhere(ip) {
  try {
    const response = await axios.get(`https://ipapi.co/${ip}/json`);
    return response.data;
  } catch (error) {
    console.log(`fail to detect request origin`);
  }
}
*/

// using geoip
async function fromWhere(ip) {
  try {
    return geoip.lookup(ip);
  } catch (error) {
    console.log(`fail to detect request origin`);
  }
}

export const generateRateLimiter = ({
  ttl = 15,
  standardHeaders = "draft-8",
  message = "error.tooManyRequests",
  status = 429,
  skipSuccessfulRequests,
  skipFailedRequests,
  limit = 1000,
} = {}) => {
  return rateLimit({
    windowMs: ttl * 60 * 1000,
    handler: function (req, res, next) {
      return sResponse.SuccessResponseHandling({ res, status, message });
    },
    // message: "Too many request",
    // statusCode: 429,
    legacyHeaders: configService.NODE_ENV == "development" ? true : false,
    skipSuccessfulRequests,
    skipFailedRequests,
    standardHeaders,
    // limit: async function (req) {
    //   const country = await fromWhere(req.ip);
    //   return country?.country === "EG" ? limit : 0;
    // },
    limit,
    keyGenerator: function (req) {
      const ip = ipKeyGenerator(req.ip, 52);
      // this is stored in req.ratelimit.key
      return `${req.ip}::${req.path}`;
    },
    store: {
      async incr(key, cb) {
        // called by keyGenerator
        try {
          const count = await client.incr(key);
          let secondsRemaining = ttl * 60;
          if (count === 1) {
            await client.expire(key, secondsRemaining);
          } else {
            secondsRemaining = await client.ttl(key);
          }
          const resetTime = new Date(Date.now() + secondsRemaining * 1000);
          cb(null, count, resetTime);
        } catch (error) {
          cb(error);
        }
      },
      async decrement(key) {
        // called by: (skipFailedRequests: true , skipSuccessfulRequests: true)
        if (await client.exists(key)) {
          await client.decr(key);
        }
      },
    },
  });
};
