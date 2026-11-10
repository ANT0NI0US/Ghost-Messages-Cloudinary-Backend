import { v2 as cloudinary } from "cloudinary";
import configService from "../../../../config/config.service.js";

cloudinary.config({
  cloud_name: configService.CLOUD_NAME,
  api_key: configService.CLOUD_API_KEY,
  api_secret: configService.CLOUD_API_SECRET,
});

export { cloudinary };
