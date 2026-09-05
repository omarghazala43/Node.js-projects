import joi from "joi";
import { Role } from "../../common/enums/role.js";
import { Gender } from "../../common/enums/gender.js";

export const emailValidation = joi
  .string()
  .email({
    minDomainSegments: 1,
    maxDomainSegments: 3,
    tlds: { allow: ["com", "net", "eg"] },
  })
  .lowercase()
  .trim()
  .messages({
    "string.email": "Invalid email",
    "any.required": "Email is required",
  })
  .required();

export const signUpSchema = {
  body: joi.object({
    fname: joi.string().required(),
    lname: joi.string().required(),
    email: emailValidation,
    password: joi.string().required(),
    confirmPassword: joi.string().valid(joi.ref("password")).required(),
    age: joi.number().min(10).max(60).positive().integer().required(),
    role: joi.string().valid(...Object.values(Role)),
    gender: joi.string().valid(...Object.values(Gender)),
  }),
};

export const loginSchema = {
  body: joi.object({
    email: emailValidation,
    password: joi.string().required(),
  }),
};

export const confirmEmailSchema = {
  body: joi.object({
    email: emailValidation,
    otp: joi.string().required(),
  }),
};

export const resendOtpSchema = {
  body: joi.object({
    email: emailValidation,
  }),
};

export const resetPasswordSchema = {
  body: joi.object({
    email: emailValidation,
    otp: joi.string().required(),
    newPassword: joi.string().required(),
  }),
};

export const resetPasswordLinkSchema = {
  params: joi.object({
    token: joi.string().required(),
  }),
  body: joi.object({
    newPassword: joi.string().required(),
  }),
};
