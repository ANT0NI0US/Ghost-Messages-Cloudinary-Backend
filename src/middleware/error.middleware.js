import configService from "../../config/config.service.js";
import { translate } from "../common/index.js";

const multerErrorKeys = {
  LIMIT_FILE_SIZE: "error.fileTooLarge",
  LIMIT_FILE_COUNT: "error.tooManyFiles",
  LIMIT_UNEXPECTED_FILE: "error.unexpectedFileField",
};

export const globalErrorHandling = (error, req, res, next) => {
  let status = error.cause?.status ?? 500;
  let issues = error.cause?.issues;
  let message = error.message;

  // Mongoose schema rule was broken (required / minLength / enum ...)
  if (error.name === "ValidationError") {
    status = 400;
    message = "validation.general.error";
    // error.errors holds every invalid field; map it to the same shape as Zod issues: { path, message }
    issues = Object.values(error.errors).map((e) => ({
      path: [e.path],
      // e.message is the translation key written in the schema (e.g. "validation.firstName.min").
      // If the value has the wrong type (e.g. DOB is not a date), Mongoose returns a CastError
      // with a raw English message, so we replace it with a known key to avoid leaking untranslated text
      message: translate(
        req.lang,
        e.name === "CastError" ? "validation.general.invalidType" : e.message,
      ),
    }));
  } else if (error.name === "MulterError") {
    status = 400;
    message = multerErrorKeys[error.code] ?? "error.invalidUpload";
    // Duplicate value on a unique field (e.g. email); this error comes from MongoDB itself, not the schema
  } else if (error.code === 11000) {
    status = 409;
    // error.keyPattern contains the duplicated field ({ email: 1 }), so we build a key like "error.duplicate.email"
    const key = `error.duplicate.${Object.keys(error.keyPattern)[0]}`;
    // If that key does not exist in the JSON, translate() returns the key itself, so we fall back to the generic message.
    // Language 0 is used only to check that the key exists, not to display anything
    message = translate(0, key) === key ? "error.duplicate.default" : key;
    // Value does not match the field type, e.g. an invalid ObjectId in _id
  } else if (error.name === "CastError") {
    status = 400;
    message = "error.invalidId";
    // express.json() could not parse the request body (e.g. a missing quote or bracket)
  } else if (error.type === "entity.parse.failed") {
    status = 400;
    message = "error.invalidJson";
  }

  const mood = configService.NODE_ENV == "production";
  const defaultErrorMessage = "error.server";
  const displayErrorMessage = message || defaultErrorMessage;
  return res.status(status).json({
    status_code: status,
    message: translate(
      req.lang,
      mood
        ? status == 500
          ? defaultErrorMessage
          : displayErrorMessage
        : displayErrorMessage,
    ),
    issues,
    stack: mood ? undefined : error.stack,
  });
};
