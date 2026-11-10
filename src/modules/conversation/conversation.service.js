import { cloud, fileUpload } from "../../common/index.js";
import { models, queries } from "../../DB/index.js";

export const getAllConversations = async (conversation) => {
  await conversation.populate({
    path: "messages.senderId",
    select: "firstName lastName",
  });

  return conversation.messages.map((message) => ({
    _id: message._id,
    content: message.content,
    attachments: message.attachments,
    time: message.createdAt,
    senderId: {
      _id: message.senderId._id,
      firstName: message.senderId.firstName,
      lastName: message.senderId.lastName,
    },
  }));
};

// UPLOAD IN THE ASSETS HERE IN THE PROJECT
// export const addNewMessageToConversation = async (
//   conversation,
//   content,
//   files = [],
//   user,
// ) => {
//   return await queries.findByIdAndUpdate({
//     model: models.ConversationModel,
//     id: conversation._id,
//     update: {
//       $push: {
//         messages: {
//           senderId: user._id,
//           content,
//           attachments: files.map((ele) => ele.path),
//         },
//       },
//     },
//   });
// };

// UPLOAD IN CLOUDINARY
export const addNewMessageToConversation = async (
  conversation,
  content,
  files = [],
  user,
) => {
  const attachments = await cloud.uploadFiles({
    files,
    folderName: `conversations/${conversation._id}`,
    validation: [
      ...fileUpload.fileValidation.image,
      ...fileUpload.fileValidation.files,
    ],
  });

  return await queries.findByIdAndUpdate({
    model: models.ConversationModel,
    id: conversation._id,
    update: {
      $push: {
        messages: {
          senderId: user._id,
          content,
          attachments,
        },
      },
    },
  });
};
