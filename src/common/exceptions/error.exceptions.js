export const ErrorResponse = ({
  message = "Error",
  status = 400,
  issues = undefined,
} = {}) => {
  throw new Error(message, { cause: { status, issues } });
};

export const BadRequestException = ({
  message = "Bad Request Exception",
  issues = undefined,
} = {}) => {
  return ErrorResponse({ message, status: 400, issues });
};

export const TooManyRequestException = ({
  message = "Too Many Request Exception",
  issues = undefined,
} = {}) => {
  return ErrorResponse({ message, status: 429, issues });
};

export const ConflictException = ({
  message = "Conflict Exception",
  issues = undefined,
} = {}) => {
  return ErrorResponse({ message, status: 409, issues });
};

export const UnauthorizedException = ({
  message = "Unauthorized Exception",
  issues = undefined,
} = {}) => {
  return ErrorResponse({ message, status: 401, issues });
};

export const NotFoundException = ({
  message = "Not Found Exception",
  issues = undefined,
} = {}) => {
  return ErrorResponse({ message, status: 404, issues });
};

export const ForbiddenException = ({
  message = "Forbidden Exception",
  issues = undefined,
} = {}) => {
  return ErrorResponse({ message, status: 403, issues });
};
