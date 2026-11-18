import { exceptions, translate } from "../common/index.js";

export const notFound = (req, res, next) => {
  const message = translate(req.lang, "error.routeNotFound")
    .replace("{url}", req.originalUrl)
    .replace("{method}", req.method);

  throw exceptions.NotFoundException({ message });
};
