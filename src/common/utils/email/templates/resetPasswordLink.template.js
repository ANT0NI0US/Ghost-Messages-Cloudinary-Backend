import { translate } from "../../../../common/index.js";
import { emailLayout } from "./layout.template.js";

export const buildResetPasswordLinkEmail = ({ lang, link, expiresIn }) => {
  const expiresInText = translate(lang, "emailTemplate.linkExpiresIn").replace(
    "{minutes}",
    `<b>${expiresIn}</b>`,
  );

  return emailLayout({
    lang,
    content: `<tr>
                <td style="padding:40px 40px 0 40px;">
                <h2 style="margin:0;color:#111827;font-size:22px;">${translate(lang, "emailTemplate.resetPasswordLinkTitle")}</h2>
                <p style="margin:12px 0 0 0;color:#6B7280;font-size:14px;">${translate(lang, "emailTemplate.resetPasswordLinkBody")}</p>
                </td>
                </tr>
                <tr>
                <td style="padding:28px 40px 0 40px;">
                <a href="${link}" style="display:inline-block;background-color:#0F172A;color:#fff;text-decoration:none;border-radius:6px;padding:14px 32px;font-size:16px;font-weight:bold;">${translate(lang, "emailTemplate.resetPasswordButton")}</a>
                </td>
                </tr>
                <tr>
                <td style="padding:20px 40px 0 40px;">
                <p style="margin:0;color:#374151;font-size:14px;">${expiresInText}</p>
                </td>
                </tr>
                <tr>
                <td style="padding:16px 40px 0 40px;">
                <p style="margin:0;color:#6B7280;font-size:12px;">${translate(lang, "emailTemplate.linkFallback")}</p>
                <p style="margin:6px 0 0 0;color:#2563EB;font-size:12px;word-break:break-all;" dir="ltr">${link}</p>
                </td>
                </tr>
                <tr>
                <td style="padding:16px 40px 40px 40px;">
                <p style="margin:0;color:#9CA3AF;font-size:13px;">${translate(lang, "emailTemplate.disclaimer")}</p>
                </td>
                </tr>`,
  });
};
