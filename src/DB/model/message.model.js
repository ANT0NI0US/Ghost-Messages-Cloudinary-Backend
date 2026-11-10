import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      minLength: [2, "validation.content.min"],
      maxLength: [50000, "validation.content.max"],
      required: function () {
        return this.attachments?.length > 0 ? false : true;
      },
    },
    // we use this when we upload this in assets only
    // attachments: [String],
    // we use this when we upload this in cloudinary only
    attachments: [
      {
        public_id: String,
        secure_url: String,
      },
    ],
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "validation.receiverId.required"],
    },
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
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

export const MessageModel =
  mongoose.models.Message || mongoose.model("Message", messageSchema);
