import { NotFoundError } from "../../common/response/error-response.js";
import User from "../../DB/models/user.model.js";
import { findOne, updateOne } from "../../DB/repository.js";

export const getProfile = async (_id) => {
  const userProfile = await findOne({ model: User, filter: { _id } });
  return userProfile;
};

export const updateUser = async (_id, data) => {
  const user = await findOne({ model: User, filter: { _id } });

  if (!user) {
    throw NotFoundError({ message: "User not found" });
  }

  const updated = await updateOne({ model: User, filter: { _id }, data });
  return updated;
};

export const updateUserProfile = async (_id, file) => {
  const user = await findOne({ model: User, filter: { _id } });

  if (!user) {
    throw NotFoundError({ message: "User not found" });
  }

  const updated = await updateOne({
    model: User,
    filter: { _id },
    data: { profileImage: file.finalPath },
  });
  return updated;
};
