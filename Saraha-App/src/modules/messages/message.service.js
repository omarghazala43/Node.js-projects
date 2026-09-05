import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from "../../common/response/error-response.js";
import Message from "../../DB/models/message.model.js";
import User from "../../DB/models/user.model.js";
import { create, findAll, findOne } from "../../DB/repository.js";

export const getMessages = async (recieverId) => {
  const messages = await findAll({
    model: Message,
    filter: { recieverId },
    // select: { content: 1, replyTo: 1, attachments: 1, createdAt: 1 },
    select: { senderId:0,recieverId:0 },
  });

  return messages;
};

export const sendMessage = async (email, content, senderId, files) => {
  const reciever = await findOne({ model: User, filter: { email } });

  if (!reciever) throw NotFoundError({ message: "User not found" });

  if (senderId == reciever.id)
    throw BadRequestError({
      message: "You cannot send a message to yourself.",
    });
  let attachments;
  if (files) {
    attachments = files.map((file) => file.finalPath);
  }

  const newMessage = await create({
    model: Message,
    data: {
      content,
      senderId,
      recieverId: reciever.id,
      attachments,
    },
  });

  return newMessage;
};

export const replyMessage = async (content, senderId, messageId, files) => {
  const message = await findOne({ model: Message, filter: { _id: messageId } });

  if (!message) throw NotFoundError({ message: "Message not found" });

  if (senderId != message.recieverId)
    throw ForbiddenError({
      message: "You can only reply to messages sent to you",
    });

  let attachments;
  if (files) {
    attachments = files.map((file) => file.finalPath);
  }

  const result = await create({
    model: Message,
    data: {
      content,
      senderId: message.recieverId,
      recieverId: message.senderId,
      replyTo: messageId,
      attachments,
    },
  });
  return result;
};
