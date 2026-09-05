import { Router } from "express";
import { auth } from "../../middleware/auth.middleware.js";
import { getMessages, replyMessage, sendMessage } from "./message.service.js";
import { successResponse } from "../../common/response/success-response.js";
import { checkEmptyMessage, validate } from "../../middleware/validator.middleware.js";
import { replyMessageSchema, sendMessageSchema } from "./message.validation.js";
import localUpload, { fileValidation } from "../../common/utils/multer.js";

const messageRouter = Router({
  mergeParams: true,
});

messageRouter.get("/", auth, async (req, res) => {
  const messages = await getMessages(req.user.id);
  return successResponse({ res, message: "All Messages", data: messages });
});

messageRouter.post(
  "/send",
  auth,

  localUpload({
    folder: "messages/send",
    maxSize: 10,
    fileValidation: fileValidation.image,
  }).array("attachments", 4),
  validate(sendMessageSchema),
  checkEmptyMessage,
  async (req, res) => {
    const { email, content } = req.body;
    await sendMessage(email, content, req.user.id, req.files);
    return successResponse({
      res,
      message: "Message sent successfully",
    });
  },
);

messageRouter.post(
  "/:messageId/reply",
  auth,

  localUpload({
    folder: "messages/reply",
    maxSize: 10,
    fileValidation: fileValidation.image,
  }).array("attachments", 4),
  validate(replyMessageSchema),
  async (req, res) => {
    const { content } = req.body;
    const { messageId } = req.params;

    await replyMessage(content, req.user.id, messageId, req.files);
    return successResponse({
      res,
      message: "Reply sent successfully",
    });
  },
);

export default messageRouter;
