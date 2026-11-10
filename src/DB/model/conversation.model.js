import mongoose from "mongoose";

const conversationMessageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "validation.senderId.required"],
    },
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
  },
  { timestamps: true },
);

const conversationSchema = new mongoose.Schema(
  {
    messageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      required: [true, "validation.messageId.required"],
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
    messages: [conversationMessageSchema],
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

export const ConversationModel =
  mongoose.models.Conversation ||
  mongoose.model("Conversation", conversationSchema);
