import multer from "multer";
import { exceptions, fileUpload } from "../common/index.js";

// multer error code → our translation key
const multerErrorKeys = {
  LIMIT_FILE_SIZE: "error.fileTooLarge", // from maxFileSize.
  LIMIT_FILE_COUNT: "error.tooManyFiles", // send files more than that we set to it.
  LIMIT_UNEXPECTED_FILE: "error.unexpectedFileField", // add the files to an incorrect field name.
};

export const fileUploadMiddleware = ({
  isRequired = true,
  customPath = "general",
  multerMiddleware,
  validation = [],
}) => {
  return async (req, res, next) => {
    multerMiddleware(req, res, async (error) => {
      try {
        if (error) {
          const key =
            error instanceof multer.MulterError
              ? multerErrorKeys[error.code]
              : undefined;
          throw exceptions.BadRequestException({
            message: key ?? "error.invalidUpload",
          });
        }
        if (
          isRequired &&
          !req.file &&
          !(Array.isArray(req.files) && req.files.length > 0) &&
          !(typeof req.files == "object" && Object.keys(req.files).length > 0)
        ) {
          throw exceptions.BadRequestException({
            message: "error.fileRequired",
          });
        }
        await fileUpload.multerUpload({ req, customPath, validation });
        next();
      } catch (error) {
        next(error);
      }
    });
  };
};
