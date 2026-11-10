import { enums } from "../common/index.js";

export const language = (req, res, next) => {
  const requested = Number(req.headers["accept-language"]);
  req.lang = Object.values(enums.LanguageEnum).includes(requested)
    ? requested
    : enums.LanguageEnum.EN;
  next();
};
