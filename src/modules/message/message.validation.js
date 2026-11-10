import { z } from "zod";
import { enums, translate } from "../../common/index.js";
import { generalValidationFields } from "../../common/validation.js";

export const createMessage = (lang) => {
  return z
    .object({
      body: z.strictObject({
        receiverId: generalValidationFields(lang).id,
        content: generalValidationFields(lang).messageContent.optional(),
      }),
      // ana hna 3aml al default b [] 34an lma nygy nst5dmo fy al superRefine lma ykon al content w al files fadyen y3ml error
      files: z.array(generalValidationFields(lang).file).max(10).default([]), // array
      // files: z.object({
      //   attachment: z.array(generalValidationFields(lang).file).max(3),
      //   attachments: z.array(generalValidationFields(lang).file).max(3),
      // }), // fields
    })
    .superRefine((data, ctx) => {
      if (!data.body.content && !data.files?.length) {
        ctx.addIssue({
          code: "custom",
          path: ["content"],
          message: translate(lang, "validation.content.required"),
        });
      }
    });
};

export const getAllMessages = (lang) => {
  return z.object({
    query: z.strictObject({
      type: z.coerce
        .number()
        .pipe(
          z.enum(enums.MessageTypeEnum, {
            error: translate(lang, "validation.messageType.invalid"),
          }),
        )
        .default(enums.MessageTypeEnum.RECEIVER),
      page: generalValidationFields(lang).page,
      limit: generalValidationFields(lang).limit,
    }),
  });
};

export const deleteMessage = (lang) => {
  return z.object({
    params: z.strictObject({
      messageId: generalValidationFields(lang).id,
    }),
  });
};

export const getMessageById = (lang) => {
  return z.object({
    params: z.strictObject({
      messageId: generalValidationFields(lang).id,
    }),
  });
};
