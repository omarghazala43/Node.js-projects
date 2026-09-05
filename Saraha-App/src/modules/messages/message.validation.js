import joi from "joi";
import { emailValidation } from "../auth/auth.validators.js";
import { Types } from "mongoose";

export const sendMessageSchema = {
  body: joi.object({
    email: emailValidation,
    content: joi.string().max(500).optional(),
  }),
  files: joi.array().optional(),
};

export const replyMessageSchema = {
  params: joi.object({
    messageId: joi
      .string()
      .custom((val, helper) => {
        if (!Types.ObjectId.isValid(val)) {
          return helper.message("Invalid userId");
        }
        return val;
      })
      .required(),
  }),
  body: joi.object({
    content: joi.string().max(500).optional(),
  }),
  files: joi.array().optional(),
};
