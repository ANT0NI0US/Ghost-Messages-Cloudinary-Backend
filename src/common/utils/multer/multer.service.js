import {
  fileTypeFromBuffer,
  // , fileTypeFromFile
} from "file-type";
// import multer from "multer";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile, readFile, unlink } from "node:fs/promises";
import { resolve } from "node:path";
import { exceptions } from "../../../common/index.js";
import configService from "../../../../config/config.service.js";

export const fileValidation = {
  image: ["image/jpeg", "image/png"],
  files: ["application/pdf"],
};

// using with only one file
// export const processFile = ({ validation = [] }) => {
//   return async (req, res, next) => {
//     const result = await fileTypeFromBuffer(req.file.buffer);
//     console.log({ result });

//     if (!result || !validation.includes(result.mime)) {
//       throw exceptions.BadRequestException({ message: "Invalid file format" });
//     }
//     const filePath = resolve(`./assets/${randomUUID()}.${result.ext}`);
//     await writeFile(filePath, req.file.buffer);
//     next();
//   };
// };

export const processFile = async ({
  customPath = "general",
  validation = [],
  file,
}) => {
  /*
   ? this is when i use multer.diskStorage() and i will get the file path and i will read it as a buffer to check the real file
   * 1)
      const bufferFile = readFile(resolve(req.file.path));
      const result = await fileTypeFromBuffer(bufferFile);
   * 2)
      const result = await fileTypeFromFile(req.file.path);
  */

  // * 3) if we want to use multer.diskStorage() to apply the same approach that we are going to use in the multer.memoryStorage() to use file.buffer

  if (file.path) {
    // anta hna already hyb2a m3ak file.path lw anta mst5dm multer.diskStorage() fa anta 34an 7wlha buffer hnst5dm readFile
    file.buffer = await readFile(file.path);
  }

  // if you use multer.memoryStorage() you will get the file as a buffer and you can use the file-type package to check the real file type even if the user changed the extension.
  const result = await fileTypeFromBuffer(file.buffer);

  if (!result || !validation.includes(result.mime)) {
    // dh hna lw al file format m4 mzbot hms7o mn %temp% 5las mb2a4 lyh lazma 7ml zayada 3la al hard disk w 5las w lazm at2kd ano fyh asln file.path 34an lw kan gy mn memoryStorage m4 hyb2a fyh file.path
    if (file.path) {
      await unlink(file.path);
    }
    throw exceptions.BadRequestException({
      message: "error.invalidFileFormat",
    });
  }

  const customFolderPath = resolve(`./assets/${customPath}`);
  await mkdir(customFolderPath, { recursive: true });

  const uniqueFilePath = `assets/${customPath}/${randomUUID()}.${result.ext}`;

  const filePath = resolve(`./${uniqueFilePath}`);
  await writeFile(filePath, file.buffer);
  // hna b2a b3d ma 5las ana dyft al file dh al mfrod kman ams7o mn al %temp%
  if (file.path) {
    await unlink(file.path);
  }
  file.path = `${configService.WEBSITE_URL}${uniqueFilePath}`;

  return file;
};

export const processArrayFiles = async ({
  customPath,
  validation = [],
  files = [],
}) => {
  const uploadedFiles = [];
  for (const file of files) {
    const uploadFile = await processFile({ customPath, validation, file });
    uploadedFiles.push(uploadFile);
  }
  return uploadedFiles;
};

export const processFields = async ({
  customPath,
  validation = [],
  fields,
}) => {
  const assets = [];

  for (const field of Object.keys(fields)) {
    const uploadedFiles = await processArrayFiles({
      customPath,
      validation,
      files: fields[field],
    });
    assets.push({ key: field, uploadedFiles });
  }

  return assets;
};

export const multerUpload = async ({
  req,
  customPath = "general",
  validation = [],
}) => {
  if (req.file) {
    await processFile({ customPath, validation, file: req.file });
  } else if (Array.isArray(req.files) && req.files.length > 0) {
    await processArrayFiles({ customPath, validation, files: req.files });
  } else if (
    typeof req.files == "object" &&
    Object.keys(req.files)?.length > 0
  ) {
    await processFields({ customPath, validation, fields: req.files });
  }
};

// export const multerUpload = ({customPath = "general", validation = [] }) => {
//   return async (req, res, next) => {
//     if (req.file) {
//       await processFile({ customPath, validation, file: req.file });
//     } else if (Array.isArray(req.files)) {
//       await processArrayFiles({ customPath, validation, files: req.files });
//     } else if (typeof req.files == "object" && Object.keys(req.files)?.length) {
//       await processFields({ customPath, validation, fields: req.files });
//     }

//     next();
//   };
// };

export const deleteLocalFile = async ({ url }) => {
  if (!url?.startsWith(configService.WEBSITE_URL)) {
    return;
  }

  const relativePath = url.slice(configService.WEBSITE_URL.length);

  try {
    await unlink(resolve(`./${relativePath}`));
  } catch (error) {
    console.error("Error while deleting file:", relativePath, error);
  }
};
