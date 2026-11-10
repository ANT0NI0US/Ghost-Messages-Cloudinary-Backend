import { Router } from "express";
import {
  cloud,
  // , fileUpload
  sResponse,
} from "../../common/index.js";
import * as middleware from "../../middleware/index.js";
import * as ms from "./message.service.js";
import * as validators from "./message.validation.js";

const router = Router({ caseSensitive: true, strict: true });

const messageFolderName = "messages";

// UPLOAD IN THE ASSETS HERE IN THE PROJECT
// router.post(
//   "/",
//   async (req, res, next) => {
//     if (req.headers["authorization"]) {
//       await middleware.bearerAuth({ req });
//     }
//     next();
//   },
//   middleware.fileUploadMiddleware({
//     isRequired: false,
//     customPath: messageFolderName,
//     multerMiddleware: fileUpload.createUploader().array("attachments", 3),
//     validation: [
//       ...fileUpload.fileValidation.image,
//       ...fileUpload.fileValidation.files,
//     ],
//   }),
//   middleware.validation(validators.createMessage),
//   async (req, res, next) => {
//     const data = await ms.createMessage(
//       req.validate.body,
//       req.validate.files,
//       req.user,
//     );
//     return sResponse.SuccessResponseHandling({
//       res,
//       message: "success.messageCreated",
//       status: 201,
//       data,
//     });
//   },
// );

// UPLOAD IN CLOUDINARY
router.post(
  "/",
  async (req, res, next) => {
    if (req.headers["authorization"]) {
      await middleware.bearerAuth({ req });
    }
    next();
  },
  cloud.cloudFileUpload().array("attachments", 10),
  middleware.validation(validators.createMessage),
  async (req, res, next) => {
    const data = await ms.createMessage(
      req.validate.body,
      req.validate.files,
      req.user,
    );
    return sResponse.SuccessResponseHandling({
      res,
      message: "success.messageCreated",
      status: 201,
      data,
    });
  },
);

router.get(
  "/all",
  middleware.authentication(),
  middleware.validation(validators.getAllMessages),
  async (req, res, next) => {
    const messages = await ms.getAllMessages(req.validate.query, req.user);
    return sResponse.SuccessResponseHandling({
      res,
      message: "success.messagesRetrieved",
      data: messages,
    });
  },
);

router.get(
  "/:messageId",
  middleware.authentication(),
  middleware.validation(validators.getMessageById),
  async (req, res, next) => {
    const message = await ms.getMessageById(req.validate.params, req.user);
    return sResponse.SuccessResponseHandling({
      res,
      message: "success.messageRetrieved",
      data: message,
    });
  },
);

router.delete(
  "/:messageId",
  middleware.authentication(),
  middleware.validation(validators.deleteMessage),
  async (req, res, next) => {
    await ms.deleteMessage(req.validate.params, req.user);
    return sResponse.SuccessResponseHandling({
      res,
      message: "success.messageDeleted",
    });
  },
);

export default router;
