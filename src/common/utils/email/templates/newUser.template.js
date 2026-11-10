import { enums, translate } from "../../../../common/index.js";
import { emailLayout } from "./layout.template.js";

export const buildNewUserEmail = ({ lang, user }) => {
  // provider is saved as a number (0, 1) → show its name (SYSTEM, GOOGLE)
  const provider = Object.keys(enums.ProviderEnum).find(
    (key) => enums.ProviderEnum[key] == user.provider,
  );

  const row = (labelKey, value) => `<tr>
                <td style="padding:8px 0;color:#6B7280;font-size:14px;">${translate(lang, labelKey)}</td>
                <td style="padding:8px 0;color:#111827;font-size:14px;font-weight:bold;">${value}</td>
                </tr>`;

  return emailLayout({
    lang,
    content: `<tr>
                <td style="padding:40px 40px 0 40px;">
                <h2 style="margin:0;color:#111827;font-size:22px;">${translate(lang, "emailTemplate.newUserTitle")}</h2>
                <p style="margin:12px 0 0 0;color:#6B7280;font-size:14px;">${translate(lang, "emailTemplate.newUserBody")}</p>
                </td>
                </tr>
                <tr>
                <td style="padding:24px 40px 40px 40px;">
                <table border="0" width="100%" style="background-color:#F3F4F6;border-radius:6px;padding:12px 20px;">
                ${row("emailTemplate.username", user.username)}
                ${row("emailTemplate.email", user.email)}
                ${row("emailTemplate.provider", provider)}
                ${row("emailTemplate.joinedAt", new Date(user.createdAt).toUTCString())}
                </table>
                </td>
                </tr>`,
  });
};
