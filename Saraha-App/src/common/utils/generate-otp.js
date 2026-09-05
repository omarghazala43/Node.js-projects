export const generateOtp = () => {
  return Math.floor(900000 * Math.random()) + 100000;
};
