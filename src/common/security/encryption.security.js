import crypto from "node:crypto";
import configService from "../../../config/config.service.js";

// console.log(crypto.randomBytes(16).toString("hex"));

export const encrypt = async (plainText) => {
  const iv = crypto.randomBytes(configService.IV_LENGTH);
  const cipherIv = crypto.createCipheriv(
    "aes-256-cbc",
    configService.ENC_KEY,
    iv,
  );
  let cipherText = cipherIv.update(plainText, "utf-8", "hex");
  cipherText += cipherIv.final("hex");
  return `${iv.toString("hex")}:${cipherText}`;
};

export const decrypt = async (cipherText) => {
  const [iv, encryptedText] = cipherText.split(":");

  const binaryLikeIv = Buffer.from(iv, "hex");
  const decipherIv = crypto.createDecipheriv(
    "aes-256-cbc",
    configService.ENC_KEY,
    binaryLikeIv,
  );

  let plainText = decipherIv.update(encryptedText, "hex", "utf8");
  plainText += decipherIv.final("utf-8");

  return plainText;
};
