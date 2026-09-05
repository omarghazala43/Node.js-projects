import joi from "joi";
import { Types } from "mongoose";
import { fileValidation } from "../../common/utils/multer.js";

export const updateUserSchema = {
  body: joi.object({
    age: joi.number().min(10).max(60).positive().integer().required(),
  }),
  params: joi.object({
    userId: joi
      .string()
      .custom((val, helper) => {
        if (!Types.ObjectId.isValid(val)) {
          return helper.message("Invalid userId");
        }
        return val;
      })
      .required(),
  }),
};

export const updateUserImageSchema = {
  file: joi.object({
    fieldname: joi.string().required(),
    originalname: joi.string().required(),
    encoding: joi.string().required(),
    mimetype: joi
      .string()
      .required()
      .valid(...fileValidation.image),
    finalPath: joi.string().required(),
    path: joi.string().required(),
    destination: joi.string().required(),
    filename: joi.string().required(),
    size: joi.number().required(),
  }),
};
