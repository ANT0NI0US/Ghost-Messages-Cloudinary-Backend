import { EventEmitter } from "node:events";
import { enums, sendEmail } from "../index.js";

export const emailEvent = new EventEmitter();

emailEvent.on(
  enums.EventsEnum.SEND_EMAIL,
  async ({ recipient, subject, data }) => {
    try {
      await sendEmail.sendEmail({
        ...recipient,
        subject,
        html: sendEmail.emailTemplate({ subject, data }),
      });
    } catch (error) {
      console.log(`Failed to send email`, error);
    }
  },
);
