import { z } from "zod";
import { generalValidationFields } from "../../common/validation.js";
import { translate } from "../../common/index.js";

export const getAllConversations = (lang) => {
  return z.object({
    query: z.strictObject({
      messageId: generalValidationFields(lang).id,
    }),
  });
};

export const addNewMessageToConversation = (lang) => {
  return z
    .object({
      body: z.strictObject({
        messageId: generalValidationFields(lang).id,
        content: generalValidationFields(lang).messageContent.optional(),
      }),
      files: z.array(generalValidationFields(lang).file).max(10).default([]),
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
