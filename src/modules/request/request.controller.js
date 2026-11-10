import { Router } from "express";
import { sResponse } from "../../common/index.js";
import * as middleware from "../../middleware/index.js";
import * as rs from "./request.service.js";
import * as validators from "./request.validation.js";

const router = Router({ caseSensitive: true, strict: true });

router.get(
  "/all",
  middleware.authentication(),
  middleware.validation(validators.getAllRequests),
  async (req, res, next) => {
    const requests = await rs.getAllRequests(req.validate.query, req.user);
    return sResponse.SuccessResponseHandling({
      res,
      message: "success.requestsRetrieved",
      data: requests,
    });
  },
);

router.post(
  "/action",
  middleware.authentication(),
  middleware.validation(validators.takeAnActionToRequest),
  async (req, res, next) => {
    const request = await rs.takeAnActionToRequest(req.validate.body, req.user);
    return sResponse.SuccessResponseHandling({
      res,
      message: "success.requestActionTaken",
      data: request,
    });
  },
);

router.post(
  "/create",
  middleware.authentication(),
  middleware.validation(validators.createRequest),
  async (req, res, next) => {
    const request = await rs.createRequest(req.validate.body, req.user);
    return sResponse.SuccessResponseHandling({
      res,
      message: "success.requestCreated",
      data: request,
    });
  },
);

export default router;
