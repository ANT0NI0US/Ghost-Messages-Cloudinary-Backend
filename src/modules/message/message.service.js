import {
  exceptions,
  enums,
  fileUpload,
  cloud,
  objectId,
} from "../../common/index.js";
import { models, queries } from "../../DB/index.js";

const populateParty = [
  { path: "senderId", select: "firstName lastName" },
  { path: "receiverId", select: "firstName lastName" },
];

// shape a populated message doc: trim it down to what the client needs,
// keep senderId null for anonymous messages instead of crashing on it
const formatMessage = (message) => ({
  _id: message._id,
  content: message.content,
  attachments: message.attachments,
  time: message.createdAt,
  senderId: message.senderId
    ? {
        _id: message.senderId._id,
        firstName: message.senderId.firstName,
        lastName: message.senderId.lastName,
      }
    : null,
  receiverId: {
    _id: message.receiverId._id,
    firstName: message.receiverId.firstName,
    lastName: message.receiverId.lastName,
  },
});

// UPLOAD IN THE ASSETS HERE IN THE PROJECT
// export const createMessage = async (
//   { content, receiverId } = {},
//   files = [],
//   user = undefined,
// ) => {
//   const checkReceiverExist = await queries.findById({
//     model: models.UserModel,
//     id: receiverId,
//   });

//   if (!checkReceiverExist) {
//     throw exceptions.NotFoundException({ message: "error.invalidReceiver" });
//   }

//   const message = await queries.create({
//     model: models.MessageModel,
//     data: {
//       receiverId,
//       content,
//       attachments: files.map((ele) => ele.path),
//       ...(user ? { senderId: user._id } : {}),
//     },
//   });
//   return message;
// };

// UPLOAD IN CLOUDINARY
export const createMessage = async (
  { content, receiverId } = {},
  files = [],
  user = undefined,
) => {
  const checkReceiverExist = await queries.findById({
    model: models.UserModel,
    id: receiverId,
  });

  if (!checkReceiverExist) {
    throw exceptions.NotFoundException({ message: "error.invalidReceiver" });
  }

  // create the id first so the files go into the message folder before anything is saved
  const messageId = objectId.toObjectId();

  const attachments = await cloud.uploadFiles({
    files,
    folderName: `messages/${messageId}`,
    validation: [
      ...fileUpload.fileValidation.image,
      ...fileUpload.fileValidation.files,
    ],
  });

  const message = await queries.create({
    model: models.MessageModel,
    data: {
      _id: messageId,
      receiverId,
      content,
      attachments,
      ...(user ? { senderId: user._id } : {}),
    },
  });

  return message;
};

export const getAllMessages = async ({ type, page, limit } = {}, user) => {
  let filter = {};
  switch (type) {
    case enums.MessageTypeEnum.ALL:
      filter = {
        $or: [{ senderId: user._id }, { receiverId: user._id }],
      };
      break;

    case enums.MessageTypeEnum.SENDER:
      filter = { senderId: user._id };
      break;

    default:
      filter = { receiverId: user._id };
      break;
  }

  const messages = await queries.paginate({
    model: models.MessageModel,
    filter,
    options: {
      sort: { createdAt: -1 },
      populate: populateParty,
    },
    page,
    limit,
  });

  return {
    ...messages,
    docs: messages.docs.map(formatMessage),
  };
};

export const deleteMessage = async ({ messageId } = {}, user) => {
  const existingMessage = await queries.findById({
    model: models.MessageModel,
    id: messageId,
  });

  if (!existingMessage) {
    throw exceptions.NotFoundException({ message: "error.messageNotFound" });
  }

  const publicIds = existingMessage.attachments.map(
    (attachment) => attachment.public_id,
  );

  const data = await queries.deleteOne({
    model: models.MessageModel,
    filter: {
      _id: messageId,
      receiverId: user._id,
    },
  });

  if (!data.deletedCount) {
    throw exceptions.NotFoundException({ message: "error.invalidMessageId" });
  }

  if (publicIds.length) {
    await cloud.deleteFiles({ publicIds });
  }

  return;
};

export const getMessageById = async ({ messageId } = {}, user) => {
  const message = await queries.findOne({
    model: models.MessageModel,
    filter: {
      _id: messageId,
      receiverId: user._id,
    },
    options: {
      populate: populateParty,
    },
  });

  if (!message) {
    throw exceptions.NotFoundException({ message: "error.messageNotFound" });
  }

  return formatMessage(message);
};
