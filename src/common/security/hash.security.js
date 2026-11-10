import bcrypt from "bcrypt";
import argon2 from "argon2";
import { enums } from "../../common/index.js";
import configService from "../../../config/config.service.js";

export const hash = async ({
  plainText,
  rounds = configService.SALT_ROUND,
  minor = "b",
  approach = enums.HashEnum.ARGON,
} = {}) => {
  if (typeof plainText !== "string") {
    plainText = String(plainText);
  }
  let cipherText = "";

  switch (approach) {
    case enums.HashEnum.ARGON:
      cipherText = await argon2.hash(plainText);
      break;
    default:
      const salt = (await bcrypt.genSalt(rounds, minor)).toString();
      cipherText = await bcrypt.hash(plainText, salt);
      break;
  }

  return cipherText;
};

export const compare = async (
  plainText,
  cipherText,
  approach = enums.HashEnum.ARGON,
) => {
  let match = "";

  switch (approach) {
    case enums.HashEnum.ARGON:
      match = await argon2.verify(cipherText, plainText);
      break;
    default:
      match = await bcrypt.compare(plainText, cipherText);
      break;
  }

  return match;
};
