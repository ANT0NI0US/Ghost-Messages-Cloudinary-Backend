import mongoose from "mongoose";
import { enums } from "../../common/index.js";

const requestSchema = new mongoose.Schema(
  {
    status: {
      type: Number,
      enum: {
        values: Object.values(enums.RequestStatusEnum),
        message: "validation.requestStatus.invalid",
      },
      default: enums.RequestStatusEnum.PENDING,
    },
    targetUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "validation.targetUserId.required"],
    },
    requesterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "validation.requesterId.required"],
    },
    messageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      required: [true, "validation.messageId.required"],
    },
  },
  {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
    strict: true,
    autoIndex: true,
    strictQuery: true,
    optimisticConcurrency: true,
  },
);

export const RequestModel =
  mongoose.models.Request || mongoose.model("Request", requestSchema);
