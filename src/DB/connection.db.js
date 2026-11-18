import mongoose from "mongoose";
import configService from "../../config/config.service.js";
import { models } from "./index.js";
import { connectRedis } from "./redis.connection.js";

export const BootstrapDB = async (app) => {
  try {
    await mongoose.connect(configService.DB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.info("DB CONNECTED 💥");

    // syncIndexes compares the DB indexes with the schemas (creates the new ones + drops the removed ones)
    // it's a development tool, so it doesn't run on every vercel cold start / pm2 restart
    // in production mongoose autoIndex still creates any missing index from the schema
    if (configService.NODE_ENV === "development") {
      await models.UserModel.syncIndexes();
      await models.MessageModel.syncIndexes();
      await models.ConversationModel.syncIndexes();
      await models.RequestModel.syncIndexes();
    }
    await connectRedis();
    // VERCEL is set automatically by vercel only, so: on my machine -> listen, on vercel -> don't listen
    if (!process.env.VERCEL) {
      app.listen(configService.PORT, () => {
        console.info(`we are running on port ${configService.PORT}`);
      });
    }
  } catch (error) {
    console.error("FAILED TO CONNECT DB ✖");
    console.error(error);
    process.exit(1);
  }
};
