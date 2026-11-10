import multer from "multer";

export const cloudFileUpload = ({ maxFileSize = 5 } = {}) => {
  const storage = multer.diskStorage({});

  return multer({
    storage,
    limits: { fileSize: maxFileSize * 1024 * 1024 },
  });
};
