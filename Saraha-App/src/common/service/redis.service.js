import { client } from "../../DB/redis.connection.js";

export const tokenKey = (userId, jti) => {
  return `TOKEN::${userId}::${jti}`;
};

export const otpKey = (email) => {
  return `OTP::${email}`;
};

export const forgetOtpKey = (email) => {
  return `OTP::FORGET_PASSWORD::${email}`;
};

export const forgetLinkKey = (email) => {
  return `Link::FORGET_PASSWORD::${email}`;
};

export const redisService = {
  async get(key) {
    const result = await client.get(key);
    if (!result) return null;
    try {
      return JSON.parse(result);
    } catch (error) {
      return result;
    }
  },

  async set({ key, val, ttl }) {
    return ttl
      ? await client.set(key, JSON.stringify(val), { EX: ttl })
      : await client.set(key, JSON.stringify(val));
  },

  delete(key) {
    return client.del(key);
  },
  ttl(key) {
    return client.ttl(key);
  },
};
