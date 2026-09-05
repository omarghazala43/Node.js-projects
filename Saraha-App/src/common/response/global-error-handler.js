export const globalErrHandler = (err, req, res, next) => {
  const message = err.message || "Internal server error";
  const status = err.cause?.status || 500;
  res.status(status).json({ message, stack: err.stack });
};
