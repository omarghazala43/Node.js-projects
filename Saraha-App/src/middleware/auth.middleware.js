import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from "../common/response/error-response.js";
import { redisService, tokenKey } from "../common/service/redis.service.js";
import { accessKey, verifyToken } from "../common/utils/token.js";
import User from "../DB/models/user.model.js";
import { findOne } from "../DB/repository.js";

export const auth = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1] || "";
  if (!token) throw BadRequestError({ message: "Token is required" });

  const decodedToken = verifyToken(token, accessKey);

  const user = await findOne({
    model: User,
    filter: { _id: decodedToken._id },
  });

  if (!user) {
    throw NotFoundError({ message: "User not found" });
  }

  if (
    user.changeCredential &&
    user.changeCredential.getTime() >= decodedToken.iat * 1000
  ) {
    throw BadRequestError({ message: "Login again" });
  }

  const loggedOutToken = await redisService.get(
    tokenKey(decodedToken._id, decodedToken.jti),
  );

  if (loggedOutToken) {
    throw BadRequestError({ message: "Login again" });
  }

  req.user = user;
  req.decodedToken = decodedToken;

  next();
};

export const authorization = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw ForbiddenError({ message: "You are not authorized" });
    }

    next();
  };
};
