import { exceptions, translate } from "../common/index.js";

const keyFor = (issue) => {
  switch (issue.code) {
    case "invalid_type":
      return issue.input === undefined
        ? "validation.general.required"
        : "validation.general.invalidType";
    case "unrecognized_keys":
      return "validation.general.unrecognizedKeys";
    default:
      return "validation.general.invalid";
  }
};

export const validation = (schema) => {
  return (req, res, next) => {
    const validationResult = schema(req.lang).safeParse(
      {
        body: req.body,
        query: req.query,
        params: req.params,
        headers: req.headers,
        files: req.files,
        file: req.file,
      },
      { error: (issue) => translate(req.lang, keyFor(issue)) },
    );
    if (!validationResult.success) {
      throw exceptions.BadRequestException({
        message: "validation.general.error",
        issues: validationResult.error.issues,
      });
    }
    req.validate = validationResult.data;
    next();
  };
};
