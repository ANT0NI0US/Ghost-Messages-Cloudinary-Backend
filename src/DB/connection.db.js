import mongoose from "mongoose";
import configService from "../../config/config.service.js";
import { models } from "./index.js";
import { connectRedis } from "./redis.connection.js";

export const BootstrapDB = async (app) => {
  try {
    await mongoose.connect(configService.DB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log("DB CONNECTED 💥");
    await models.UserModel.syncIndexes();
    await models.MessageModel.syncIndexes();
    await models.ConversationModel.syncIndexes();
    await models.RequestModel.syncIndexes();
    await connectRedis();
    // dh hna hft7 al comment dh lma akon 48al development 34an lma akon 48al 3la vercel dh m4 hy4t8l 34an hwa byb2a mstny function fa btar any a3ml export default app; fy al main.js .
    // app.listen(configService.PORT, () => {
    //   console.log(`we are running on port ${configService.PORT}`);
    // });
  } catch (error) {
    console.log("FAILED TO CONNECT DB ✖");
    console.log(error);
    process.exit(1);
  }
};
