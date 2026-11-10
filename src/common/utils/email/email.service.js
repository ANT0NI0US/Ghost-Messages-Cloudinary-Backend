import crypto from "crypto";
import nodemailer from "nodemailer";
import configService from "../../../../config/config.service.js";
import {
  enums,
  events,
  exceptions,
  security,
  services,
} from "../../../common/index.js";
import { transporter } from "./email.config.js";
import { createOtp } from "./otp.js";

export const UserEmailKey = ({ email, subject }) => {
  return `User::${email}::${subject}_OTP`;
};

export const UserOtpTrialsKey = ({ email, subject }) => {
  return `${UserEmailKey({ email, subject })}::Trials`;
};

// the token itself is the key → from the link we can reach the user id
export const ResetPasswordTokenKey = ({ token }) => {
  return `Reset_Password::${token}`;
};

// one key per user → we know if he already has a valid link (prevent spamming his inbox)
export const UserResetLinkKey = ({ email }) => {
  return `User::${email}::Reset_Password_Link`;
};

// counts how many times the user TRIED to enter the otp (not how many times we sent it)
export const UserOtpAttemptsKey = ({ email, subject }) => {
  return `${UserEmailKey({ email, subject })}::Attempts`;
};

export async function sendEmail({
  to,
  cc,
  bcc,
  subject,
  text,
  html,
  attachments = [],
} = {}) {
  try {
    if (!to?.length && !cc?.length && !bcc?.length) {
      throw exceptions.BadRequestException({
        message: "error.invalidRecipient",
      });
    }
    if (!text?.length && !html?.length && !attachments?.length) {
      throw exceptions.BadRequestException({
        message: "error.invalidEmailContent",
      });
    }

    const info = await transporter.sendMail({
      from: `"${configService.APPLICATION_NAME}" <${configService.APP_EMAIL}>`, // sender address
      to, // list of recipients
      cc,
      bcc,
      subject, // subject line
      text, // plain text body
      html, // HTML body
      attachments,
    });

    console.log("Message sent: %s", info.messageId);
    // Preview URL is only available when using an Ethereal test account
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  } catch (err) {
    console.error("Error while sending mail:", err);
  }
}

export const checkOTP = async ({
  email,
  otp,
  subject = enums.EmailSubjectEnum.CONFIRM_EMAIL,
  maxAttempts = configService.MAX_OTP_ATTEMPTS,
}) => {
  const otpKey = UserEmailKey({ email, subject });
  const attemptsKey = UserOtpAttemptsKey({ email, subject });

  const hashOtp = await services.get({ key: otpKey });

  // no otp (expired or never sent) → nothing to compare with
  if (!hashOtp) {
    throw exceptions.BadRequestException({ message: "error.invalidOtp" });
  }

  // count this attempt BEFORE comparing: incr is atomic in redis,
  // so even if the attacker sends many requests at the same time each one gets a different number
  const attempts = await services.incrBy({ key: attemptsKey });

  // first attempt → make the counter die together with the otp itself
  if (attempts == 1) {
    // how many seconds left until the otp expires (or -1 if it doesn't exist anymore)
    const otpTTL = await services.ttl({ key: otpKey });
    // make the counter die together with the otp itself (or immediately if it doesn't exist anymore)
    await services.expire({
      key: attemptsKey,
      ttl: Math.max(otpTTL, 1),
    });
  }

  // too many attempts → burn the otp, the user must request a new one
  // (and requesting is already limited by MAX_OTP_TRIALS + BLOCK_OTP_TIME)
  if (attempts > maxAttempts) {
    await services.del({ key: [otpKey, attemptsKey] });
    throw exceptions.TooManyRequestException({
      message: "error.otpAttemptsExceeded",
    });
  }

  // compare the otp with the hashed one in cache
  if (!(await security.compare(otp, hashOtp))) {
    throw exceptions.BadRequestException({ message: "error.invalidOtp" });
  }

  // correct otp → reset the counter so the next step of the same flow starts clean
  // (ex: verify-forgot-password-code then reset-password check the same otp twice)
  await services.del({ key: attemptsKey });
};

export const sendEmailOtp = async ({
  email,
  subject = enums.EmailSubjectEnum.CONFIRM_EMAIL,
  lang,
  maxTrials = configService.MAX_OTP_TRIALS,
  otpExpiresTime = configService.OTP_EXPIRES_TIME,
  blockOtpTime = configService.BLOCK_OTP_TIME,
}) => {
  const existOtpTTL = await services.ttl({
    key: UserEmailKey({ email, subject }),
  });

  if (existOtpTTL > 0) {
    throw exceptions.ConflictException({ message: "error.otpStillValid" });
  }

  const currentTrials =
    (await services.get({
      key: UserOtpTrialsKey({ email, subject }),
    })) ?? 0;

  if (currentTrials >= maxTrials) {
    throw exceptions.TooManyRequestException({
      message: "error.otpLimitReached",
    });
  }

  const otp = createOtp();

  await services.set({
    key: UserEmailKey({ email, subject }),
    value: await security.hash({ plainText: otp.toString() }),
    ttl: otpExpiresTime,
  });

  const finalTrials = await services.incrBy({
    key: UserOtpTrialsKey({ email, subject }),
  });

  if (finalTrials == 1 || finalTrials == maxTrials) {
    await services.expire({
      key: UserOtpTrialsKey({ email, subject }),
      ttl: blockOtpTime,
    });
  }

  events.emailEvent.emit(enums.EventsEnum.SEND_EMAIL, {
    recipient: { to: email },
    subject,
    data: { code: otp, lang, expiresIn: Math.ceil(otpExpiresTime / 60) },
  });
};

export const sendResetPasswordLink = async ({
  email,
  userId,
  lang,
  linkExpiresTime = configService.RESET_PASSWORD_LINK_EXPIRES_TIME,
}) => {
  const userLinkKey = UserResetLinkKey({ email });

  // same idea as otpStillValid: there is a valid link already → don't send another one
  if ((await services.ttl({ key: userLinkKey })) > 0) {
    throw exceptions.ConflictException({
      message: "error.resetLinkStillValid",
    });
  }

  const token = crypto.randomBytes(32).toString("hex");

  await Promise.all([
    // stored as an object because services.get does JSON.parse,
    // and a plain id string could be parsed as a number
    services.set({
      key: ResetPasswordTokenKey({ token }),
      value: { userId },
      ttl: linkExpiresTime,
    }),
    services.set({ key: userLinkKey, value: 1, ttl: linkExpiresTime }),
  ]);

  events.emailEvent.emit(enums.EventsEnum.SEND_EMAIL, {
    recipient: { to: email },
    subject: enums.EmailSubjectEnum.RESET_PASSWORD_LINK,
    data: {
      lang,
      link: `${configService.FRONTEND_URL}/reset-password/${token}`,
      expiresIn: Math.ceil(linkExpiresTime / 60),
    },
  });
};
