import { fileTypeFromFile } from "file-type";
import { unlink } from "node:fs/promises";
import { exceptions } from "../../../common/index.js";
import configService from "../../../../config/config.service.js";
import { cloudinary } from "./cloudinary.config.js";

export const uploadFile = async ({
  file,
  folderName,
  validation = [],
} = {}) => {
  // 1- validate file type
  const result = await fileTypeFromFile(file.path);

  if (!result || !validation.includes(result.mime)) {
    if (file.path) {
      await unlink(file.path);
    }
    throw exceptions.BadRequestException({
      message: "error.invalidFileFormat",
    });
  }

  // 2- upload on cloudinary to get the secure-Url and public_id
  const { public_id, secure_url } = await cloudinary.uploader.upload(
    file.path,
    {
      folder: `${configService.APPLICATION_NAME}/${folderName}`,
    },
  );

  // 3- remove the file from the disk storage.
  if (file.path) {
    await unlink(file.path);
  }

  return { public_id, secure_url };
};

export const uploadFiles = async ({
  files,
  folderName,
  validation = [],
} = {}) => {
  const coverImages = [];
  for (const file of files) {
    const uploadedFile = await uploadFile({
      file,
      folderName,
      validation,
    });
    coverImages.push(uploadedFile);
  }

  return coverImages;
};

export const deleteFile = async ({ publicId }) => {
  return await cloudinary.uploader.destroy(publicId);
};

export const deleteFiles = async ({ publicIds }) => {
  return await cloudinary.api.delete_resources(publicIds);
};

export const deleteFolderAssets = async ({ folderName }) => {
  return await cloudinary.api.delete_resources_by_prefix(folderName);
};

export const deleteFolder = async ({ folderName }) => {
  return await cloudinary.api.delete_folder(folderName);
};
