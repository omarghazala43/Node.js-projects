import { Router } from "express";
import {
  confirmEmail,
  createAccessToken,
  forgetPassword,
  forgetPasswordLink,
  login,
  logOut,
  resendOtp,
  resetPassword,
  resetPasswordLink,
  signUp,
} from "./auth.service.js";
import { successResponse } from "../../common/response/success-response.js";
import axios from "axios";
import { OAuth2Client } from "google-auth-library";
import { create, findOne } from "../../DB/repository.js";
import User from "../../DB/models/user.model.js";
import { createCredential } from "../../common/utils/token.js";
import { System } from "../../common/enums/system.js";
import { BadRequestError } from "../../common/response/error-response.js";
import { validate } from "../../middleware/validator.middleware.js";
import {
  confirmEmailSchema,
  loginSchema,
  resendOtpSchema,
  resetPasswordLinkSchema,
  resetPasswordSchema,
  signUpSchema,
} from "./auth.validators.js";
import { auth } from "../../middleware/auth.middleware.js";

const authRouter = Router();

authRouter.post("/register", validate(signUpSchema), async (req, res) => {
  const user = await signUp(req.body);
  return successResponse({
    res,
    status: 201,
    data: user,
    message: "User added successfully",
  });
});

authRouter.post("/login", validate(loginSchema), async (req, res) => {
  const user = await login(req.body);
  return successResponse({
    res,
    data: user,
    message: "User login successfully",
  });
});

authRouter.patch("/logout", auth, async (req, res) => {
  await logOut(
    req.user._id,
    req.body.flag,
    req.decodedToken.jti,
    req.decodedToken.iat,
  );
  return successResponse({
    res,
    message: "Logged out successfully",
  });
});

authRouter.post("/refresh-token", async (req, res) => {
  const { token } = req.body;

  const accessToken = await createAccessToken(token);

  return successResponse({
    res,
    data: { accessToken },
  });
});

authRouter.patch(
  "/confirm-email",
  validate(confirmEmailSchema),
  async (req, res) => {
    const user = await confirmEmail(req.body);
    return successResponse({
      res,
      data: user,
      message: "Email confirmed successfully",
    });
  },
);

authRouter.post("/resend-otp", validate(resendOtpSchema), async (req, res) => {
  await resendOtp(req.body);
  return successResponse({ res, message: "OTP resent successfully" });
});

authRouter.post(
  "/forget-password",
  validate(resendOtpSchema),
  async (req, res) => {
    await forgetPassword(req.body);
    return successResponse({ res, message: "OTP sent successfully" });
  },
);

authRouter.post(
  "/reset-password",
  validate(resetPasswordSchema),
  async (req, res) => {
    await resetPassword(req.body);
    return successResponse({ res, message: "Password reset successfully" });
  },
);

authRouter.post(
  "/forget-password-link",
  validate(resendOtpSchema),
  async (req, res) => {
    await forgetPasswordLink(req.body);
    return successResponse({ res, message: "Link sent successfully" });
  },
);

authRouter.post(
  "/reset-password-link/:token",
  validate(resetPasswordLinkSchema),
  async (req, res) => {
    await resetPasswordLink(req.body, req.params);
    return successResponse({ res, message: "Password reset successfully" });
  },
);

// #####################################################

let REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;
let CLIENT_ID = process.env.CLIENT_ID;
let CLIENT_SECRET = process.env.CLIENT_SECRET;
authRouter.get("/google", (req, res) => {
  const url =
    "https://accounts.google.com/o/oauth2/v2/auth?" +
    `client_id=${CLIENT_ID}` +
    `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
    `&response_type=code` +
    `&scope=openid%20email%20profile` +
    `&access_type=offline` +
    `&prompt=select_account`;

  res.redirect(url);
});

authRouter.get("/google/callback", async (req, res) => {
  const { code } = req.query;

  const data = await axios.post("https://oauth2.googleapis.com/token", {
    code,
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    redirect_uri: REDIRECT_URI,
    grant_type: "authorization_code",
  });

  const { access_token, id_token } = data.data;

  const client = new OAuth2Client(CLIENT_ID);
  const ticket = await client.verifyIdToken({
    idToken: id_token,
    audience: CLIENT_ID,
  });

  const payload = ticket.getPayload();

  if (payload && payload.email_verified) {
    let existUser = await findOne({
      model: User,
      filter: { email: payload.email },
    });

    if (!existUser) {
      existUser = await create({
        model: User,
        data: {
          email: payload.email,
          fname: payload.given_name,
          lname: payload.family_name,
          provider: System.GMAIL,
        },
      });
    }

    const { accessToken, refreshToken } = createCredential(existUser);

    return successResponse({
      res,
      data: { accessToken, refreshToken },
      message: "User login successfully",
    });
  } else {
    throw BadRequestError({ message: "Invalid email" });
  }

  res.json({ message: "Hello from callback API" });
});

export default authRouter;
