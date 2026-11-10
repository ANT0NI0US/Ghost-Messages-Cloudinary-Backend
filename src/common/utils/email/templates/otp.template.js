import { enums, translate } from "../../../../common/index.js";
import { emailLayout } from "./layout.template.js";

// the otp template serves more than one subject, each one with its own title
const titleKeyBySubject = {
  [enums.EmailSubjectEnum.CONFIRM_EMAIL]: "emailTemplate.confirmEmailTitle",
  [enums.EmailSubjectEnum.TWO_STEP_VERIFICATION]:
    "emailTemplate.twoStepVerificationTitle",
  [enums.EmailSubjectEnum.FORGOT_PASSWORD]: "emailTemplate.forgotPasswordTitle",
};

export const buildOtpEmail = ({ lang, subject, code, expiresIn }) => {
  const title = translate(lang, titleKeyBySubject[subject]);
  const expiresInText = translate(lang, "emailTemplate.expiresIn").replace(
    "{minutes}",
    `<b>${expiresIn}</b>`,
  );

  return emailLayout({
    lang,
    content: `<tr>
                <td style="padding:40px 40px 0 40px;">
                <h2 style="margin:0;color:#111827;font-size:22px;">${title}</h2>
                <p style="margin:12px 0 0 0;color:#6B7280;font-size:14px;">${translate(lang, "emailTemplate.yourOtp")}</p>
                </td>
                </tr>
                <tr>
                <td style="padding:24px 40px 0 40px;">
                <p style="margin:0;background-color:#F3F4F6;border-radius:6px;padding:18px 20px;color:#111827;font-size:28px;font-weight:bold;letter-spacing:10px;">${code}</p>
                </td>
                </tr>
                <tr>
                <td style="padding:20px 40px 0 40px;">
                <p style="margin:0;color:#374151;font-size:14px;">${expiresInText}</p>
                </td>
                </tr>
                <tr>
                <td style="padding:16px 40px 40px 40px;">
                <p style="margin:0;color:#9CA3AF;font-size:13px;">${translate(lang, "emailTemplate.disclaimer")}</p>
                </td>
                </tr>`,
  });
};
