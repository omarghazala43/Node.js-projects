export const errorResponse = ({ message, status }) => {
  throw new Error(message, { cause: { status } });
};

export const NotFoundError = ({message}) => {
  return errorResponse({ message, status: 404 });
};

export const BadRequestError = ({message}) => {
  return errorResponse({ message, status: 400 });
};

export const ForbiddenError = ({message}) => {
  return errorResponse({ message, status: 403 });
};

export const ConflictError = ({message}) => {
  return errorResponse({ message, status: 409 });
};
