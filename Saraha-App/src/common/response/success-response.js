export const successResponse = ({res, status = 200, message = "Done", data}) => {
  res.status(status).json({ message, data });
};
