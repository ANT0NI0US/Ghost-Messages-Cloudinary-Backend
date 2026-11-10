import { z } from "zod";
import { enums, translate } from "../../common/index.js";
import { generalValidationFields } from "../../common/validation.js";

export const getAllRequests = (lang) => {
  return z.object({
    query: z.strictObject({
      type: z.coerce
        .number()
        .pipe(
          z.enum(enums.RequestsTypeEnum, {
            error: translate(lang, "validation.messageType.invalid"),
          }),
        )
        .default(enums.RequestsTypeEnum.ALL),
      page: generalValidationFields(lang).page,
      limit: generalValidationFields(lang).limit,
    }),
  });
};

export const takeAnActionToRequest = (lang) => {
  return z.object({
    body: z.strictObject({
      action: z.enum(enums.ActionInRequestEnum, {
        error: translate(lang, "validation.messageType.invalid"),
      }),
      requestId: generalValidationFields(lang).id,
    }),
  });
};

export const createRequest = (lang) => {
  return z.object({
    body: z.strictObject({
      messageId: generalValidationFields(lang).id,
    }),
  });
};
