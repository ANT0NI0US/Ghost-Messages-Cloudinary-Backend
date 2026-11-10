import { enums } from "../../../../common/index.js";
import { buildNewUserEmail } from "./newUser.template.js";
import { buildOtpEmail } from "./otp.template.js";
import { buildResetPasswordLinkEmail } from "./resetPasswordLink.template.js";

// subjects that are not here (CONFIRM_EMAIL, TWO_STEP_VERIFICATION, FORGOT_PASSWORD) use the otp template
const builderBySubject = {
  [enums.EmailSubjectEnum.RESET_PASSWORD_LINK]: buildResetPasswordLinkEmail,
  [enums.EmailSubjectEnum.NEW_USER_REGISTERED]: buildNewUserEmail,
};

export const emailTemplate = ({ subject, data = {} }) => {
  const build = builderBySubject[subject] ?? buildOtpEmail;
  return build({ ...data, subject });
};
