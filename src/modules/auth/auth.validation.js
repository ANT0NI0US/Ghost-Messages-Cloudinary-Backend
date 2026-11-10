import { z } from "zod";
import { generalValidationFields } from "../../common/validation.js";
import { enums, translate } from "../../common/index.js";

export const signupLoginWithGmail = (lang) => {
  return z.object({
    body: z.strictObject({
      idToken: z.jwt({
        alg: "RS256",
        error: translate(lang, "validation.idToken.invalid"),
      }),
    }),
  });
};

export const loginSchema = (lang) => {
  return z.strictObject({
    email: generalValidationFields(lang).email,
    password: generalValidationFields(lang).password,
  });
};

export const login = (lang) => {
  return z.object({
    body: loginSchema(lang),
  });
};

export const signup = (lang) => {
  return z.object({
    body: loginSchema(lang)
      .safeExtend({
        username: generalValidationFields(lang).username,
        phone: generalValidationFields(lang).phone,
        confirmPassword: generalValidationFields(lang).password,
        DOB: generalValidationFields(lang).DOB,
        gender: generalValidationFields(lang).gender,
      })
      .superRefine((data, ctx) => {
        generalValidationFields(lang).checkEquality({
          original: "password",
          copy: "confirmPassword",
          data,
          ctx,
          lang,
          messageKey: "validation.password.mismatch",
        });
        if (!data.username.includes(" ")) {
          ctx.addIssue({
            code: "custom",
            path: ["username"],
            message: translate(lang, "validation.username.twoParts"),
          });
        }
      }),
  });
};

export const confirmEmailSchema = (lang) => {
  return z.strictObject({
    email: generalValidationFields(lang).email,
    otp: generalValidationFields(lang).otp,
  });
};

export const confirmEmail = (lang) => {
  return z.object({
    body: confirmEmailSchema(lang),
  });
};

export const loginConfirmation = (lang) => {
  return z.object({
    body: confirmEmailSchema(lang),
  });
};

export const confirmTwoStepVerification = (lang) => {
  return z.object({
    body: z.strictObject({
      otp: generalValidationFields(lang).otp,
    }),
  });
};

export const reSendConfirmEmail = (lang) => {
  return z.object({
    body: z.strictObject({
      email: generalValidationFields(lang).email,
    }),
  });
};

export const requestForgetPasswordCode = (lang) => {
  return z.object({
    body: z.strictObject({
      email: generalValidationFields(lang).email,
    }),
  });
};

export const verifyForgotPasswordCode = (lang) => {
  return z.object({
    body: confirmEmailSchema(lang),
  });
};

export const resetPassword = (lang) => {
  return z.object({
    body: confirmEmailSchema(lang)
      .safeExtend({
        password: generalValidationFields(lang).password,
        confirmPassword: generalValidationFields(lang).password,
      })
      .superRefine((data, ctx) => {
        generalValidationFields(lang).checkEquality({
          original: "password",
          copy: "confirmPassword",
          data,
          ctx,
          lang,
          messageKey: "validation.password.mismatch",
        });
      }),
  });
};

export const forgotPassword = (lang) => {
  return z.object({
    body: z.strictObject({
      email: generalValidationFields(lang).email,
    }),
  });
};

export const resetPasswordFromLink = (lang) => {
  return z.object({
    params: z.strictObject({
      // crypto.randomBytes(32).toString("hex") → always 64 hex characters
      token: z.string().regex(/^[a-f0-9]{64}$/, {
        error: translate(lang, "validation.resetToken.invalid"),
      }),
    }),
    body: z
      .strictObject({
        password: generalValidationFields(lang).password,
        confirmPassword: generalValidationFields(lang).password,
      })
      .superRefine((data, ctx) => {
        generalValidationFields(lang).checkEquality({
          original: "password",
          copy: "confirmPassword",
          data,
          ctx,
          lang,
          messageKey: "validation.password.mismatch",
        });
      }),
  });
};

export const logout = (lang) => {
  return z.object({
    body: z
      .strictObject({
        action: z.enum(enums.LogoutEnum).default(enums.LogoutEnum.DEVICE),
      })
      .prefault({}),
  });
};

// export const rotateToken = (lang) => {
//   return z.object({
//     headers: z.object({
//       authorization: generalValidationFields(lang).jwt,
//     }),
//   });
// };
