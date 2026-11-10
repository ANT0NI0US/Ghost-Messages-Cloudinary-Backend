import multer from "multer";
import { randomUUID } from "node:crypto";
import { mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { enums } from "../../index.js";

export const createUploader = ({
  maxFileSize = 5,
  storageApproach = enums.StorageApproachEnum.MEMORY,
} = {}) => {
  const storage =
    storageApproach == enums.StorageApproachEnum.MEMORY
      ? multer.memoryStorage()
      : multer.diskStorage({
          // where i will store the files.
          destination: async function (req, file, cb) {
            // we are using tmpdir() to store it in the hard disk in windows + R => %temp%
            cb(null, tmpdir());
          },

          // filename for every file and i add randomUUID to accept files if it has the same name
          filename: function (req, file, cb) {
            cb(null, randomUUID() + "__" + file.originalname);
          },
        });

  return multer({
    storage,
    limits: { fileSize: maxFileSize * 1024 * 1024 },
  });
};

export const memoryFileUpload = ({ maxFileSize = 5 } = {}) => {
  const storage = multer.memoryStorage();

  return multer({
    storage,
    limits: { fileSize: maxFileSize * 1024 * 1024 },
  });
};

// this why we didn't use it ? cause in some reasons some users can change the extension for any file and we can't know that so we use multer.memoryStorage(); this is return a buffer so it gives us the ability to use the npm i file-type that can check the real file extension even if the user change it.
export const localFileUpload = ({ maxFileSize = 5 } = {}) => {
  const storage = multer.diskStorage({
    // where i will store the files.
    destination: async function (req, file, cb) {
      // if i leave the cb(null, "./assets") here as a string the folder if not exist will not be created so i will use the resolve to create the folder if not exist.

      const folderPath = resolve("./assets");
      await mkdir(folderPath, { recursive: true });
      cb(null, folderPath);
    },

    // filename for every file and i add randomUUID to accept files if it has the same name
    filename: function (req, file, cb) {
      cb(null, randomUUID() + "__" + file.originalname);
    },
  });

  /*
    ? filter the excitons that i will accept you must pass the validation array.
  * 1)
  async function fileFilter(req, file, cb) {
    if (validation.includes(file.mimetype)) {
      cb(new Error("Invalid file format", { cause: { status: 400 } }), false);
    } else {
      cb(null, true);
    }
  }

  * 2)
  if (file.mimetype != "image/jpeg" && file.mimetype != "image/jpg") {
        cb(new Error("Invalid file format", { cause: { status: 400 } }), false);
    } else {
        cb(null, true);
    }
  }
  */

  return multer({
    // fileFilter,
    storage,
    limits: { fileSize: maxFileSize * 1024 * 1024 },
  });
};
