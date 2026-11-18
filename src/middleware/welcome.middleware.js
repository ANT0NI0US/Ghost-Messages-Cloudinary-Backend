import { translate } from "../common/index.js";

export const welcome = (req, res, next) => {
  return res
    .status(200)
    .json({ message: translate(req.lang, "success.welcome") });
};
