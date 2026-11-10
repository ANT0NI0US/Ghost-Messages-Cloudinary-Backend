import { Router } from "express";
import {
  enums,
  issuer,
  limiter,
  sResponse,
  services,
} from "../../common/index.js";
import * as middleware from "../../middleware/index.js";
import * as as from "./auth.service.js";
import * as validators from "./auth.validation.js";

const router = Router({ caseSensitive: true, strict: true });

router.post(
  "/signup-with-gmail",
  middleware.validation(validators.signupLoginWithGmail),
  async (req, res) => {
    const { status, ...tokens } = await as.signupLoginWithGmail(
      req.validate.body,
      issuer.getIssuer(req),
    );

    return sResponse.SuccessResponseHandling({
      res,
      status,
      message: status == 200 ? "success.gmailLogin" : "success.gmailSignup",
      data: tokens,
    });
  },
);

router.post(
  "/signup",
  middleware.validation(validators.signup),
  async (req, res) => {
    await as.signup(req.validate.body, req.lang);

    return sResponse.SuccessResponseHandling({
      res,
      status: 201,
      message: "success.signup",
    });
  },
);

router.patch(
  "/confirm-email",
  middleware.validation(validators.confirmEmail),
  async (req, res) => {
    const tokens = await as.confirmEmail(
      req.validate.body,
      issuer.getIssuer(req),
    );

    return sResponse.SuccessResponseHandling({
      res,
      message: "success.emailConfirmed",
      data: tokens,
    });
  },
);

router.patch(
  "/resend-confirm-email",
  middleware.validation(validators.reSendConfirmEmail),
  async (req, res) => {
    await as.reSendConfirmEmail(req.validate.body, req.lang);

    return sResponse.SuccessResponseHandling({
      res,
      message: "success.otpSent",
    });
  },
);

const loginLimiterMiddleware = limiter.generateRateLimiter({
  limit: 5,
  ttl: 5,
  skipSuccessfulRequests: true,
});

router.post(
  "/login",
  loginLimiterMiddleware,
  middleware.validation(validators.login),
  async (req, res) => {
    const tokens = await as.login(
      req.validate.body,
      issuer.getIssuer(req),
      req.lang,
    );
    // delete the key after i enter a correct email and password
    await services.del({ key: req.rateLimit.key });

    return sResponse.SuccessResponseHandling({
      res,
      message: tokens ? "success.login" : "success.otpSent",
      data: tokens,
    });
  },
);

router.patch(
  "/login-confirmation",
  middleware.validation(validators.loginConfirmation),
  async (req, res) => {
    const tokens = await as.loginConfirmation(
      req.validate.body,
      issuer.getIssuer(req),
    );

    return sResponse.SuccessResponseHandling({
      res,
      message: "success.login",
      data: tokens,
    });
  },
);

// 2_STEP_VERIFICATION
router.post(
  "/enable-two-step-verification",
  middleware.authentication(),
  async (req, res) => {
    await as.enableTwoStepVerification(req.user, req.lang);

    return sResponse.SuccessResponseHandling({
      res,
      message: "success.otpSent",
    });
  },
);

router.patch(
  "/confirm-two-step-verification",
  middleware.authentication(),
  middleware.validation(validators.confirmTwoStepVerification),
  async (req, res) => {
    await as.confirmTwoStepVerification(req.user, req.validate.body);

    return sResponse.SuccessResponseHandling({
      res,
      message: "success.twoStepVerificationEnabled",
    });
  },
);

// FORGOT PASSWORD
router.post(
  "/request-forgot-password-code",
  middleware.validation(validators.requestForgetPasswordCode),
  async (req, res) => {
    await as.requestForgetPasswordCode(req.validate.body, req.lang);

    return sResponse.SuccessResponseHandling({
      res,
      message: "success.otpSent",
    });
  },
);

router.post(
  "/verify-forgot-password-code",
  middleware.validation(validators.verifyForgotPasswordCode),
  async (req, res) => {
    await as.verifyForgotPasswordCode(req.validate.body);

    return sResponse.SuccessResponseHandling({
      res,
      message: "success.otpVerified",
    });
  },
);

router.patch(
  "/reset-password",
  middleware.validation(validators.resetPassword),
  async (req, res) => {
    await as.resetPassword(req.validate.body);

    return sResponse.SuccessResponseHandling({
      res,
      message: "success.passwordReset",
    });
  },
);

// FORGOT PASSWORD (LINK)
router.post(
  "/forgot-password",
  middleware.validation(validators.forgotPassword),
  async (req, res) => {
    await as.forgotPassword(req.validate.body, req.lang);

    return sResponse.SuccessResponseHandling({
      res,
      message: "success.resetLinkSent",
    });
  },
);

router.patch(
  "/reset-password/:token",
  middleware.validation(validators.resetPasswordFromLink),
  async (req, res) => {
    await as.resetPasswordFromLink(req.validate.params, req.validate.body);

    return sResponse.SuccessResponseHandling({
      res,
      message: "success.passwordReset",
    });
  },
);

router.post(
  "/rotate-token",
  middleware.authentication({
    tokenType: enums.TokenTypeEnum.REFRESH,
    allowBasic: false,
  }),
  async (req, res) => {
    const tokens = await as.rotateToken(
      req.payload,
      req.user,
      issuer.getIssuer(req),
    );

    return sResponse.SuccessResponseHandling({
      res,
      message: "success.tokensRotated",
      data: tokens,
    });
  },
);

router.post(
  "/logout",
  middleware.authentication({ allowBasic: false }),
  middleware.validation(validators.logout),
  async (req, res) => {
    await as.logout(req.payload, req.user, req.validate.body);

    return sResponse.SuccessResponseHandling({
      res,
      message: "success.logout",
    });
  },
);

export default router;
