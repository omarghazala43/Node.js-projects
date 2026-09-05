import { otpTemplate } from "../../common/templates/otp-temp.js";
import { resetPasswordTemplate } from "../../common/templates/reset-password-temp.js";
import { System } from "../../common/enums/system.js";
import {
  BadRequestError,
  NotFoundError,
} from "../../common/response/error-response.js";
import {
  forgetLinkKey,
  forgetOtpKey,
  otpKey,
  redisService,
  tokenKey,
} from "../../common/service/redis.service.js";
import { generateOtp } from "../../common/utils/generate-otp.js";
import { hash, compare } from "../../common/utils/hash.js";
import emailEmitter from "../../common/utils/mail-event.js";
import { sendEmail } from "../../common/utils/mail.js";
import {
  createCredential,
  generateToken,
  refreshKey,
  resetPassKey,
  verifyToken,
} from "../../common/utils/token.js";
import User from "../../DB/models/user.model.js";
import { create, findOne, findOneAndUpdate, updateOne } from "../../DB/repository.js";

export const signUp = async (input) => {
  const existUser = await findOne({
    model: User,
    filter: { email: input.email },
  });

  if (existUser) throw BadRequestError({ message: "User exist" });

  input.password = await hash(input.password);
  const user = await create({ model: User, data: input });

  const otp = generateOtp();
  await redisService.set({
    key: otpKey(user.email),
    val: await hash(`${otp}`),
    ttl: 120,
  });

  emailEmitter.emit("sendEmail", () => {
    sendEmail({
      to: user.email,
      subject: "Confirm Email",
      html: otpTemplate({ OTP_CODE: otp, EXPIRATION_TIME: 2 }),
    });
  });

  return user;
};

// #####################################################

export const login = async (input) => {
  const existUser = await findOne({
    model: User,
    filter: { email: input.email },
  });
  if (!existUser) throw NotFoundError({ message: "Invalid email or password" });

  if (existUser.provider === System.GMAIL)
    throw BadRequestError({ message: "Login with gmail" });

  if (!existUser.confirmEmail)
    throw BadRequestError({ message: "Email not confirmed" });

  const checkPasswprd = await compare(input.password, existUser.password);

  if (!checkPasswprd)
    throw BadRequestError({ message: "Invalid email or password" });

  return createCredential(existUser);
};

// #####################################################

export const logOut = async (_id, flag, jti, iat) => {
  if (flag === "all") {
    await updateOne({
      model: User,
      filter: { _id },
      data: { $set: { changeCredential: new Date() } },
    });
  } else {
    await redisService.set({
      key: tokenKey(_id, jti),
      val: jti,
      ttl: iat + 60 * 60,
    });
  }
};

// #####################################################

export const createAccessToken = async (refreshToken) => {
  const decoded = verifyToken(refreshToken, refreshKey);

  const user = await findOne({ model: User, filter: { _id: decoded._id } });

  const { accessToken } = createCredential(user);

  return accessToken;
};

// #####################################################

export const confirmEmail = async (input) => {
  const { email, otp } = input;

  const user = await findOne({ model: User, filter: { email } });

  if (user.confirmEmail)
    throw BadRequestError({ message: "Email already confirmed" });

  if (!user) throw NotFoundError({ message: "User not found" });

  const hashedOtp = await redisService.get(otpKey(user.email));
  if (!hashedOtp) throw BadRequestError({ message: "Expired OTP" });

  const isValid = await compare(otp, hashedOtp);
  if (!isValid) throw BadRequestError({ message: "Invalid OTP" });

  const updated = await findOneAndUpdate({
    model: User,
    filter: { email },
    data: { confirmEmail: true },
  });
  await redisService.delete(otpKey(user.email));

  return updated;
};

// #####################################################

export const resendOtp = async (input) => {
  const { email } = input;

  const existUser = await findOne({
    model: User,
    filter: { email },
  });

  if (!existUser) throw NotFoundError({ message: "User not found" });

  if (existUser.confirmEmail)
    throw BadRequestError({ message: "Email already confirmed" });

  const otpValid = await redisService.ttl(otpKey(existUser.email));

  if (otpValid > 0)
    throw BadRequestError({
      message: `OTP is still valid, try after ${otpValid} second`,
    });

  const otp = generateOtp();
  await redisService.set({
    key: otpKey(existUser.email),
    val: await hash(`${otp}`),
    ttl: 120,
  });

  emailEmitter.emit("sendEmail", () => {
    sendEmail({
      to: existUser.email,
      subject: "Confirm Email",
      html: otpTemplate({ OTP_CODE: otp, EXPIRATION_TIME: 2 }),
    });
  });

  return;
};

// #####################################################

export const forgetPassword = async (input) => {
  const { email } = input;

  const existUser = await findOne({
    model: User,
    filter: { email, confirmEmail: true },
  });

  if (!existUser) throw NotFoundError({ message: "User not found" });

  const otpValid = await redisService.ttl(forgetOtpKey(existUser.email));

  if (otpValid > 0)
    throw BadRequestError({
      message: `OTP is still valid, try after ${otpValid} second`,
    });

  const otp = generateOtp();
  await redisService.set({
    key: forgetOtpKey(existUser.email),
    val: await hash(`${otp}`),
    ttl: 120,
  });

  emailEmitter.emit("sendEmail", () => {
    sendEmail({
      to: existUser.email,
      subject: "Forget Password",
      html: otpTemplate({ OTP_CODE: otp, EXPIRATION_TIME: 2 }),
    });
  });

  return;
};

// #####################################################

export const resetPassword = async (input) => {
  const { email, otp, newPassword } = input;

  const user = await findOne({
    model: User,
    filter: { email, confirmEmail: true },
  });

  if (!user) throw NotFoundError({ message: "User not found" });

  const hashedOtp = await redisService.get(forgetOtpKey(user.email));
  if (!hashedOtp) throw BadRequestError({ message: "Expired OTP" });

  const isValid = await compare(otp, hashedOtp);
  if (!isValid) return BadRequestError({ message: "Invalid OTP" });

  user.password = await hash(newPassword);
  user.changeCredential = new Date();

  await user.save();
  await redisService.delete(forgetOtpKey(user.email));

  return;
};

// #####################################################

export const forgetPasswordLink = async (input) => {
  const { email } = input;

  const user = await findOne({
    model: User,
    filter: { email, confirmEmail: true },
  });

  if (!user) throw NotFoundError({ message: "User not found" });

  const resetToken = generateToken({
    data: { _id: user._id },
    key: resetPassKey,
    subject: "Reset Password",
    expiresIn: "5m",
  });

  const resetLink = `http://localhost:8000/auth/reset-password-link/${resetToken}`;

  const otpValid = await redisService.ttl(forgetLinkKey(user.email));

  if (otpValid > 0)
    throw BadRequestError({
      message: `Link is still valid, try after ${otpValid} second`,
    });

  await redisService.set({
    key: forgetLinkKey(user.email),
    val: 1,
    ttl: 60 * 5,
  });

  emailEmitter.emit("sendEmail", () => {
    sendEmail({
      to: email,
      subject: "Reset Password",
      html: resetPasswordTemplate({ resetLink }),
    });
  });

  return;
};

// #####################################################

export const resetPasswordLink = async (body, params) => {
  const { newPassword } = body;
  const { token } = params;

  const decodedToken = verifyToken(token, resetPassKey);

  const user = await findOne({
    model: User,
    filter: { _id: decodedToken._id },
  });

  if (!user) throw NotFoundError({ message: "User not found" });

  user.password = await hash(newPassword);
  user.changeCredential = new Date();

  await user.save();
  await redisService.delete(forgetLinkKey(user.email));

  return;
};
