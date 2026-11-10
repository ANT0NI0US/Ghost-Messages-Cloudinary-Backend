import { translate } from "../index.js";

export const SuccessResponseHandling = ({
  res,
  status = 200,
  message = "success.done",
  data = undefined,
} = {}) => {
  return res.status(status).json({
    status_code: status,
    message: translate(res.req.lang, message),
    data,
  });
};
