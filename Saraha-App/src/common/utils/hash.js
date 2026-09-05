import bcrypt from "bcrypt";

export const hash = (plainText, salt = 12) => {
  return bcrypt.hash(plainText, salt);
};

export const compare = (plainText, hashedText) => {
  return bcrypt.compare(plainText, hashedText);
};
