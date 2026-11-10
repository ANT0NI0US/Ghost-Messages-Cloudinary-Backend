import { OAuth2Client } from "google-auth-library";
import configService from "../../../config/config.service.js";
import { models, queries } from "../../DB/index.js";
import {
  exceptions,
  enums,
  security,
  services,
  sendEmail,
} from "../../common/index.js";

const client = new OAuth2Client();

async function verifyGoogleAccount(idToken) {
  const ticket = await client
    .verifyIdToken({
      idToken,
      audience: configService.WEB_CLIENT_IDS,
    })
    .catch(() => {
      throw exceptions.UnauthorizedException({ message: "error.invalidToken" });
    });

  const payload = ticket.getPayload();

  if (!payload) {
    throw exceptions.BadRequestException({ message: "error.invalidToken" });
  }

  return payload;
}

export const signupLoginWithGmail = async ({ idToken }, issuer) => {
  const { email, picture, email_verified, given_name, family_name } =
    await verifyGoogleAccount(idToken);

  if (!email || !email_verified) {
    throw exceptions.BadRequestException({ message: "error.emailNotVerified" });
  }

  const existingEmail = await queries.findOne({
    model: models.UserModel,
    filter: { email, paranoid: false },
  });
  if (existingEmail) {
    // if the email already exist with any provider not equal google
    if (existingEmail.provider != enums.ProviderEnum.GOOGLE) {
      throw exceptions.ConflictException({ message: "error.invalidProvider" });
    }

    if (existingEmail.status == enums.AccountStatusEnum.ARCHIVE) {
      throw exceptions.ForbiddenException({ message: "error.accountArchived" });
    }

    // login with gmail
    const { access_token, refresh_token } =
      await security.createLoginCredentials({
        user: existingEmail,
        options: { issuer },
      });

    return { status: 200, access_token, refresh_token };
  }
  // signup with gmail
  const account = await queries.create({
    model: models.UserModel,
    data: {
      firstName: given_name ?? email.split("@")[0],
      lastName: family_name,
      email,
      confirmEmail: new Date(),
      image: picture,
      provider: enums.ProviderEnum.GOOGLE,
    },
  });

  const { access_token, refresh_token } = await security.createLoginCredentials(
    {
      user: account,
      options: { issuer },
    },
  );

  return { status: 201, access_token, refresh_token };
};

export const signup = async (inputs, lang) => {
  const { email } = inputs;

  const existingEmail = await queries.findOne({
    model: models.UserModel,
    filter: { email, paranoid: false },
  });

  if (existingEmail?.status == enums.AccountStatusEnum.ARCHIVE) {
    throw exceptions.ForbiddenException({ message: "error.accountArchived" });
  }

  if (existingEmail) {
    throw exceptions.ConflictException({ message: "error.emailExists" });
  }

  const account = await queries.create({
    model: models.UserModel,
    data: inputs,
  });

  await sendEmail.sendEmailOtp({
    email,
    lang,
  });

  return;
};

export const confirmEmail = async ({ email, otp }, issuer) => {
  const account = await queries.findOne({
    model: models.UserModel,
    filter: {
      email,
      provider: enums.ProviderEnum.SYSTEM,
      confirmEmail: { $exists: false },
    },
  });

  if (!account) {
    throw exceptions.NotFoundException({ message: "error.invalidAccount" });
  }

  await sendEmail.checkOTP({
    email,
    otp,
    subject: enums.EmailSubjectEnum.CONFIRM_EMAIL,
  });

  account.confirmEmail = new Date();
  await account.save();

  await services.del({
    key: await services.keys({
      prefix: sendEmail.UserEmailKey({
        email,
        subject: enums.EmailSubjectEnum.CONFIRM_EMAIL,
      }),
    }),
  });

  const { access_token, refresh_token } = await security.createLoginCredentials(
    {
      user: account,
      options: { issuer },
    },
  );

  return { access_token, refresh_token };
};

export const reSendConfirmEmail = async ({ email }, lang) => {
  const account = await queries.findOne({
    model: models.UserModel,
    filter: {
      email,
      provider: enums.ProviderEnum.SYSTEM,
      confirmEmail: { $exists: false },
    },
  });

  if (!account) {
    throw exceptions.NotFoundException({ message: "error.invalidAccount" });
  }

  await sendEmail.sendEmailOtp({
    email,
    lang,
  });
};

// FORGOT PASSWORD
export const requestForgetPasswordCode = async ({ email }, lang) => {
  const account = await queries.findOne({
    model: models.UserModel,
    filter: {
      email,
      provider: enums.ProviderEnum.SYSTEM,
      confirmEmail: { $exists: true },
    },
  });

  if (!account) {
    throw exceptions.NotFoundException({ message: "error.invalidAccount" });
  }

  await sendEmail.sendEmailOtp({
    email,
    lang,
    subject: enums.EmailSubjectEnum.FORGOT_PASSWORD,
  });
};

export const verifyForgotPasswordCode = async ({ email, otp }) => {
  const account = await queries.findOne({
    model: models.UserModel,
    filter: {
      email,
      provider: enums.ProviderEnum.SYSTEM,
      confirmEmail: { $exists: true },
    },
  });

  if (!account) {
    throw exceptions.NotFoundException({ message: "error.invalidAccount" });
  }

  await sendEmail.checkOTP({
    email,
    otp,
    subject: enums.EmailSubjectEnum.FORGOT_PASSWORD,
  });

  return account;
};

export const resetPassword = async ({ email, otp, password }) => {
  const account = await verifyForgotPasswordCode({ email, otp });

  account.password = password;
  account.changeCredentialsTime = new Date();

  await account.save();

  const [userRevokeKeys, userEmailKeys] = await Promise.all([
    services.keys({
      prefix: security.userBaseRevokeToken({ userId: account._id }),
    }),
    services.keys({
      prefix: sendEmail.UserEmailKey({
        email,
        subject: enums.EmailSubjectEnum.FORGOT_PASSWORD,
      }),
    }),
  ]);

  await services.del({
    key: [
      ...userRevokeKeys,
      ...userEmailKeys,
      security.userBaseProfile({ userId: account._id }),
    ],
  });

  return;
};

// FORGOT PASSWORD (LINK)
export const forgotPassword = async ({ email }, lang) => {
  const user = await queries.findOne({
    model: models.UserModel,
    filter: {
      email,
      provider: enums.ProviderEnum.SYSTEM,
      confirmEmail: { $exists: true },
    },
  });

  if (!user) {
    throw exceptions.NotFoundException({ message: "error.invalidAccount" });
  }

  await sendEmail.sendResetPasswordLink({ email, userId: user.id, lang });
  return;
};

export const resetPasswordFromLink = async ({ token }, { password }) => {
  const resetKey = sendEmail.ResetPasswordTokenKey({ token });
  const { userId } = (await services.get({ key: resetKey })) ?? {};

  if (!userId) {
    throw exceptions.BadRequestException({ message: "error.invalidResetLink" });
  }

  const user = await queries.findOne({
    model: models.UserModel,
    filter: {
      _id: userId,
      provider: enums.ProviderEnum.SYSTEM,
      confirmEmail: { $exists: true },
    },
  });

  if (!user) {
    throw exceptions.NotFoundException({ message: "error.invalidAccount" });
  }

  // plain password: the pre("save") hook in user.model hashes it
  user.password = password;
  user.changeCredentialsTime = new Date();
  await user.save();

  // delete AFTER save, so if save fails the link still works
  const userRevokeKeys = await services.keys({
    prefix: security.userBaseRevokeToken({ userId }),
  });

  await services.del({
    key: [
      resetKey,
      sendEmail.UserResetLinkKey({ email: user.email }),
      ...userRevokeKeys,
      security.userBaseProfile({ userId }),
    ],
  });

  return;
};

export const login = async ({ email, password }, issuer, lang) => {
  const LoginTrialsKey = `User::${email}::Login_Trials`;

  const currentTrials =
    (await services.get({
      key: LoginTrialsKey,
    })) ?? 0;

  if (currentTrials >= configService.MAX_INCORRECT_PASSWORD_ATTEMPTS) {
    throw exceptions.TooManyRequestException({
      message: "error.loginLimitReached",
    });
  }

  // Get the account that has the same email and signup with system and the confirmationEmail is true.
  const account = await queries.findOne({
    model: models.UserModel,
    filter: {
      email,
      provider: enums.ProviderEnum.SYSTEM,
      confirmEmail: { $exists: true },
      paranoid: false,
    },
    // password has select: false in the model so we must ask for it to compare
    select: "+password",
  });

  // If there is no account invalid credentials.
  if (!account)
    throw exceptions.ForbiddenException({
      message: "error.invalidCredentials",
    });

  // Compare between the password that user enter and the actual user password.
  const match = await security.compare(password, account.password);

  if (!match) {
    const finalTrials = await services.incrBy({
      key: LoginTrialsKey,
    });

    if (
      finalTrials == 1 ||
      finalTrials == configService.MAX_INCORRECT_PASSWORD_ATTEMPTS
    ) {
      await services.expire({
        key: LoginTrialsKey,
        ttl: configService.BLOCK_OTP_TIME,
      });
    }
    throw exceptions.ForbiddenException({
      message: "error.invalidCredentials",
    });
  }

  await services.del({
    key: LoginTrialsKey,
  });

  if (account.status == enums.AccountStatusEnum.ARCHIVE) {
    throw exceptions.ForbiddenException({ message: "error.accountArchived" });
  }

  if (account.twoStepVerification) {
    await sendEmail.sendEmailOtp({
      email,
      subject: enums.EmailSubjectEnum.TWO_STEP_VERIFICATION,
      lang,
    });

    return;
  }

  const { access_token, refresh_token } = await security.createLoginCredentials(
    {
      user: account,
      options: { issuer },
    },
  );

  return { access_token, refresh_token };
};

export const loginConfirmation = async ({ email, otp }, issuer) => {
  const account = await queries.findOne({
    model: models.UserModel,
    filter: {
      email,
      provider: enums.ProviderEnum.SYSTEM,
    },
  });

  if (!account) {
    throw exceptions.NotFoundException({ message: "error.invalidAccount" });
  }

  if (!account.twoStepVerification) {
    throw exceptions.ConflictException({
      message: "error.twoStepVerificationNotEnabled",
    });
  }

  await sendEmail.checkOTP({
    email,
    otp,
    subject: enums.EmailSubjectEnum.TWO_STEP_VERIFICATION,
  });

  await services.del({
    key: [
      sendEmail.UserEmailKey({
        email,
        subject: enums.EmailSubjectEnum.TWO_STEP_VERIFICATION,
      }),
      sendEmail.UserOtpTrialsKey({
        email,
        subject: enums.EmailSubjectEnum.TWO_STEP_VERIFICATION,
      }),
    ],
  });

  const { access_token, refresh_token } = await security.createLoginCredentials(
    {
      user: account,
      options: { issuer },
    },
  );

  return { access_token, refresh_token };
};

export const enableTwoStepVerification = async (
  { email, twoStepVerification },
  lang,
) => {
  if (twoStepVerification) {
    throw exceptions.ConflictException({
      message: "error.twoStepVerificationAlreadyEnabled",
    });
  }
  await sendEmail.sendEmailOtp({
    email: email,
    subject: enums.EmailSubjectEnum.TWO_STEP_VERIFICATION,
    lang,
  });
};

export const confirmTwoStepVerification = async (user, { otp }) => {
  if (user.twoStepVerification) {
    throw exceptions.ConflictException({
      message: "error.twoStepVerificationAlreadyEnabled",
    });
  }
  await sendEmail.checkOTP({
    email: user.email,
    otp,
    subject: enums.EmailSubjectEnum.TWO_STEP_VERIFICATION,
  });

  user.twoStepVerification = true;
  // we use validateModifiedOnly: true cause we remove password from back in all cases and we don't want to validate it.
  await user.save({ validateModifiedOnly: true });

  await services.del({
    key: [
      sendEmail.UserEmailKey({
        email: user.email,
        subject: enums.EmailSubjectEnum.TWO_STEP_VERIFICATION,
      }),
      sendEmail.UserOtpTrialsKey({
        email: user.email,
        subject: enums.EmailSubjectEnum.TWO_STEP_VERIFICATION,
      }),
    ],
  });

  await services.del({ key: security.userBaseProfile({ userId: user._id }) });
};

export const rotateToken = async (payload, user, issuer) => {
  const accessExpiresIn =
    (payload.iat + configService.ACCESS_TOKEN_EXPIRES_IN) * 1000;
  const currentTime = Date.now() + 5 * 60000;

  if (currentTime < accessExpiresIn) {
    throw exceptions.ConflictException({ message: "error.rotateTooEarly" });
  }

  // revoke the old access + refresh tokens (they share the same jti),
  // so the old refresh token can't be used again after this rotate.
  await security.createRevokeToken({ payload });

  // expires in refresh token REFRESH_TOKEN_EXPIRES_IN - (Math.ceil(Date.now() / 1000)) - payload.iat depend on the requirements.
  const { access_token, refresh_token } = await security.createLoginCredentials(
    {
      user,
      options: { issuer },
    },
  );

  return { access_token, refresh_token };
};

export const logout = async (
  payload,
  user,
  { action = enums.LogoutEnum.DEVICE } = {},
) => {
  switch (action) {
    case enums.LogoutEnum.ALL:
      user.changeCredentialsTime = new Date();
      // we use validateModifiedOnly: true cause we remove password from back in all cases and we don't want to validate it.
      await user.save({ validateModifiedOnly: true });

      const userRevokeKeys = await services.keys({
        prefix: security.userBaseRevokeToken({ userId: payload.sub }),
      });

      await services.del({
        key: [
          ...userRevokeKeys,
          security.userBaseProfile({ userId: payload.sub }),
        ],
      });

      break;

    default:
      await security.createRevokeToken({ payload });
      break;
  }
  return;
};
