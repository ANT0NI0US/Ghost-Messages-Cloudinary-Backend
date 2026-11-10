import nodemailer from "nodemailer";
import configService from "../../../../config/config.service.js";

export const transporter = nodemailer.createTransport({
  service: "gmail",
  secure: true,

  auth: {
    user: configService.APP_EMAIL,
    pass: configService.APP_PASSWORD,
  },
});
