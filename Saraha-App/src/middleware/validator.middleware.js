import { BadRequestError } from "../common/response/error-response.js";

export const validate = (schema) => {
  return (req, res, next) => {
    const error = [];
    for (const key of Object.keys(schema)) {
      const result = schema[key].validate(req[key], { abortEarly: false });

      if (result.error) {
        const errors = result.error.details.map((e) => {
          return { message: e.message, path: e.path };
        });
        error.push({ field: key, errors });
      }
    }
    if (error.length) {
      return res
        .status(400)
        .json({ message: "validation error", errors: error });
    }

    next();
  };
};

export const checkEmptyMessage = (req, res, next) => {
  const hasContent = req.body.content?.trim();
  const hasFiles = req.files?.length > 0;

  if (!hasContent && !hasFiles) {
    throw BadRequestError({ message: "Content or attachments required" });
  }

  next();
};
