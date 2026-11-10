import { exceptions } from "../common/index.js";
import { models, queries } from "../DB/index.js";

export const conversationAccess = ({ from = "body" } = {}) => {
  return async (req, res, next) => {
    const { messageId } = req.validate[from];

    const message = await queries.findById({
      model: models.MessageModel,
      id: messageId,
    });

    if (!message) {
      throw exceptions.NotFoundException({ message: "error.messageNotFound" });
    }

    if (!message.conversationId) {
      throw exceptions.NotFoundException({
        message: "error.conversationNotFound",
      });
    }

    const conversation = await queries.findById({
      model: models.ConversationModel,
      id: message.conversationId,
    });

    if (!conversation) {
      throw exceptions.NotFoundException({
        message: "error.conversationNotFound",
      });
    }

    if (
      conversation.targetUserId.toString() !== req.user._id.toString() &&
      conversation.requesterId.toString() !== req.user._id.toString()
    ) {
      throw exceptions.ForbiddenException({ message: "error.forbidden" });
    }

    req.conversation = conversation;
    next();
  };
};
