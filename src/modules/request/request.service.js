import { enums, exceptions } from "../../common/index.js";
import { models, queries } from "../../DB/index.js";

/*
* message
hwaida => sender
mickey => receiver (aly m4 3arf)
---------------------
* create
requesterId => receiver (mickey)
targetUserId => sender (hwaida)
---------------------
* get
hn3ml get mn al sender aly hwa hwaida (targetUserId)
---------------------
* action
hta5od action mn al sender aly hwa hwaida (targetUserId)
*/

export const getAllRequests = async ({ type, page, limit } = {}, user) => {
  let filter = {};
  switch (type) {
    case enums.RequestsTypeEnum.ACCEPTED:
      filter = {
        targetUserId: user._id,
        status: enums.RequestStatusEnum.ACCEPTED,
      };
      break;

    case enums.RequestsTypeEnum.REJECTED:
      filter = {
        targetUserId: user._id,
        status: enums.RequestStatusEnum.REJECTED,
      };
      break;

    case enums.RequestsTypeEnum.PENDING:
      filter = {
        targetUserId: user._id,
        status: enums.RequestStatusEnum.PENDING,
      };
      break;

    default:
      filter = { targetUserId: user._id };
      break;
  }

  const requests = await queries.paginate({
    model: models.RequestModel,
    filter,
    options: {
      sort: { createdAt: -1 },
      populate: [{ path: "requesterId", select: "firstName lastName" }],
    },
    page,
    limit,
  });

  return requests;
};

export const takeAnActionToRequest = async (
  { action, requestId } = {},
  user,
) => {
  const request = await queries.findOne({
    model: models.RequestModel,
    filter: {
      _id: requestId,
      targetUserId: user._id,
    },
  });

  if (!request) {
    throw exceptions.NotFoundException({ message: "error.requestNotFound" });
  }

  if (request.status !== enums.RequestStatusEnum.PENDING) {
    throw exceptions.BadRequestException({
      message: "error.requestAlreadyHandled",
    });
  }

  request.status = action;
  await request.save();

  if (action === enums.ActionInRequestEnum.ACCEPTED) {
    const conversation = await queries.create({
      model: models.ConversationModel,
      data: {
        messageId: request.messageId,
        targetUserId: request.targetUserId,
        requesterId: request.requesterId,
      },
    });

    await queries.findByIdAndUpdate({
      model: models.MessageModel,
      id: request.messageId,
      update: { conversationId: conversation._id },
    });
  }

  return request;
};

export const createRequest = async ({ messageId } = {}, user) => {
  const message = await queries.findById({
    model: models.MessageModel,
    id: messageId,
  });

  if (!message) {
    throw exceptions.NotFoundException({ message: "error.messageNotFound" });
  }

  if (message.receiverId?.toString() !== user._id.toString()) {
    throw exceptions.ForbiddenException({ message: "error.forbidden" });
  }

  if (!message.senderId) {
    throw exceptions.BadRequestException({
      message: "error.anonymousMessageNoSender",
    });
  }

  const existingRequest = await queries.findOne({
    model: models.RequestModel,
    filter: {
      messageId,
      targetUserId: message.senderId,
      requesterId: user._id,
    },
  });

  if (existingRequest) {
    throw exceptions.BadRequestException({
      message: "error.requestAlreadySent",
    });
  }

  const request = await queries.create({
    model: models.RequestModel,
    data: {
      messageId,
      targetUserId: message.senderId,
      requesterId: user._id,
    },
  });

  return request;
};
