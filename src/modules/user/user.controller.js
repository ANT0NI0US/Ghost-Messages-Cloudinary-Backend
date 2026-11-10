import { Router } from "express";
import {
  cloud,
  enums,
  // , fileUpload
  sResponse,
} from "../../common/index.js";
import * as middleware from "../../middleware/index.js";
import * as us from "./user.service.js";
import * as validators from "./user.validation.js";

const router = Router({ caseSensitive: true, strict: true });

router.get("/profile", middleware.authentication(), async (req, res) => {
  const user = await us.profile(req.user);
  return sResponse.SuccessResponseHandling({
    res,
    message: "success.userRetrieved",
    data: user,
  });
});

router.get(
  "/all",
  middleware.authentication(),
  middleware.authorization(enums.RoleEnum.ADMIN),
  middleware.validation(validators.getAllUsers),
  async (req, res) => {
    const users = await us.allUsers(req.validate.query);
    return sResponse.SuccessResponseHandling({
      res,
      message: "success.usersRetrieved",
      data: users,
    });
  },
);

router.patch(
  "/update",
  middleware.authentication(),
  middleware.validation(validators.update),
  async (req, res) => {
    const updatedUser = await us.updateUser(req.user, req.validate.body);
    return sResponse.SuccessResponseHandling({
      res,
      message: "success.userUpdated",
      data: updatedUser,
    });
  },
);

router.get(
  "/:userId/share-profile",
  middleware.validation(validators.shareProfile),
  async (req, res) => {
    const user = await us.shareProfile(req.validate.params);
    return sResponse.SuccessResponseHandling({
      res,
      message: "success.userRetrieved",
      data: user,
    });
  },
);

// UPLOAD IN THE ASSETS HERE IN THE PROJECT
// router.patch(
//   "/profile-image",
//   middleware.authentication(),
//   middleware.fileUploadMiddleware({
//     isRequired: true,
//     customPath: "User",
//     multerMiddleware: fileUpload.createUploader().single("attachment"),
//     validation: fileUpload.fileValidation.image,
//   }),
//   middleware.validation(validators.profileImage),
//   async (req, res) => {
//     const image = await us.profileImage(req.user, req.validate.file);
//     return sResponse.SuccessResponseHandling({
//       res,
//       message: "success.profileImageUpdated",
//       data: image,
//     });
//   },
// );

// UPLOAD IN CLOUDINARY
router.patch(
  "/profile-image",
  middleware.authentication(),
  cloud.cloudFileUpload().single("attachment"),
  middleware.validation(validators.profileImage),
  async (req, res) => {
    const image = await us.profileImage(req.user, req.validate.file);
    return sResponse.SuccessResponseHandling({
      res,
      message: "success.profileImageUpdated",
      data: image,
    });
  },
);

router.patch(
  "/cover-images",
  middleware.authentication(),
  cloud.cloudFileUpload().array("attachments", 5),
  middleware.validation(validators.coverImages),
  async (req, res) => {
    const images = await us.coverImages(req.user, req.validate.files);
    return sResponse.SuccessResponseHandling({
      res,
      message: "success.coverImagesUpdated",
      data: images,
    });
  },
);

router.delete(
  "/profile-image",
  middleware.authentication(),
  async (req, res) => {
    await us.deleteProfileImage(req.user);
    return sResponse.SuccessResponseHandling({
      res,
      message: "success.profileImageDeleted",
    });
  },
);

router.delete(
  "/:userId",
  middleware.authentication(),
  middleware.authorization(enums.RoleEnum.ADMIN),
  middleware.validation(validators.deleteUser),
  async (req, res) => {
    await us.deleteUser(req.user, req.validate.params);
    return sResponse.SuccessResponseHandling({
      res,
      message: "success.userDeleted",
    });
  },
);

// ----------------------------------------------------------------------- //

router.patch(
  "/:userId/status",
  middleware.authentication(),
  middleware.authorization(enums.RoleEnum.ADMIN),
  middleware.validation(validators.toggleAccountStatus),
  async (req, res) => {
    const data = await us.updateStatus(
      req.user,
      req.validate.params,
      req.validate.body,
    );
    return sResponse.SuccessResponseHandling({
      res,
      message: "success.userStatusUpdated",
      data,
    });
  },
);

export default router;
