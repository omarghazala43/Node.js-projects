import { Router } from "express";
import { successResponse } from "../../common/response/success-response.js";
import { auth, authorization } from "../../middleware/auth.middleware.js";
import { Role } from "../../common/enums/role.js";
import {
  getProfile,
  updateUser,
  updateUserProfile,
} from "./user.service.js";
import { validate } from "../../middleware/validator.middleware.js";
import { updateUserImageSchema, updateUserSchema } from "./user.validation.js";
import localUpload, { fileValidation } from "../../common/utils/multer.js";
import messageRouter from "../messages/message.controller.js";

const userRouter = Router();

userRouter.use("/messages", messageRouter);

userRouter.get("/profile", auth, async (req, res) => {
  const user = await getProfile(req.user._id);
  return successResponse({ res, data: user });
});

userRouter.put(
  "/update-image",
  auth,
  authorization(Role.USER),
  localUpload({ fileValidation: fileValidation.image, maxSize: 5 }).single(
    "profile",
  ),
  validate(updateUserImageSchema),
  async (req, res) => {
    const updated = await updateUserProfile(req.user._id, req.file);
    return successResponse({ res, data: updated });
  },
);

userRouter.put(
  "/:userId",
  auth,
  authorization(Role.ADMIN),
  validate(updateUserSchema),
  async (req, res) => {
    const updated = await updateUser(req.params.userId, req.body);
    return successResponse({ res, data: updated });
  },
);



export default userRouter;
