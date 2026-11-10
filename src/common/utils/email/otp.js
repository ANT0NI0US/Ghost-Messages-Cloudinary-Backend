import { randomInt } from "node:crypto";

export const createOtp = () => {
  return randomInt(100000, 1000000).toString();
};

// export const createOtp = () => {
//   return Math.floor(Math.random() * 900000 + 100000);
// };
