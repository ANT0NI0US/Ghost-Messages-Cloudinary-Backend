import configService from "../../../../../config/config.service.js";
import { enums, translate } from "../../../../common/index.js";

// header (app name) + footer (social links) are the same in every email, only the content in the middle changes
export const emailLayout = ({ lang, content }) => {
  const dir = lang === enums.LanguageEnum.AR ? "rtl" : "ltr";

  return `<!DOCTYPE html>
                <html dir="${dir}">
                <head>
                    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css"></head>
                <style type="text/css">
                body{background-color: #F3F4F6;margin: 0px;font-family: 'Courier New', Courier, monospace;}
                </style>
                <body style="margin:0px;">
                <table border="0" width="50%" style="margin:auto;padding:0;background-color: #fff;border:1px solid #E5E7EB;border-radius:8px;overflow:hidden;">
                <tr>
                <td style="background-color:#0F172A;padding:24px 0;text-align:center;">
                <h1 style="margin:0;color:#fff;font-size:22px;">${configService.APPLICATION_NAME}</h1>
                </td>
                </tr>
                <tr>
                <td>
                <table border="0" cellpadding="0" cellspacing="0" style="text-align:center;width:100%;background-color: #fff;">
                ${content}
                </table>
                </td>
                </tr>
                <tr>
                <td>
                <table border="0" width="100%" style="border-radius: 5px;text-align: center;">
                <tr>
                <td>
                <h3 style="margin-top:5px; color:#000">${translate(lang, "emailTemplate.stayInTouch")}</h3>
                </td>
                </tr>
                <tr>
                <td>
                <div style="margin-top:10px;">

                <a href="${configService.FACEBOOK}" style="text-decoration: none;"><span class="twit" style="padding:10px 9px;color:#fff;border-radius:50%;">
                <img src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703402/Group35062_erj5dx.png" width="50px" hight="50px"></span></a>

                <a href="${configService.INSTAGRAM}" style="text-decoration: none;"><span class="twit" style="padding:10px 9px;color:#fff;border-radius:50%;">
                <img src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703402/Group35063_zottpo.png" width="50px" hight="50px"></span>
                </a>

                <a href="${configService.TWITTER}" style="text-decoration: none;"><span class="twit" style="padding:10px 9px;;color:#fff;border-radius:50%;">
                <img src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703402/Group_35064_i8qtfd.png" width="50px" hight="50px"></span>
                </a>

                </div>
                </td>
                </tr>
                </table>
                </td>
                </tr>
                </table>
                </body>
                </html>`;
};
