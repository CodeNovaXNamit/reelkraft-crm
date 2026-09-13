export type ApplicationErrorCode =
  | "AUTHENTICATION_ERROR"
  | "AUTHORIZATION_ERROR"
  | "VALIDATION_ERROR"
  | "NOT_FOUND"
  | "CONFLICT"
  | "INTEGRATION_ERROR"
  | "RATE_LIMIT"
  | "INTERNAL_ERROR";

export class ApplicationError extends Error {
  readonly code: ApplicationErrorCode;
  readonly details?: Record<string, unknown>;

  constructor(
    code: ApplicationErrorCode,
    message: string,
    details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "ApplicationError";
    this.code = code;
    this.details = details;
  }
}

export function toSafeErrorMessage(error: unknown) {
  if (error instanceof ApplicationError) {
    return error.message;
  }

  return "Something went wrong. Please try again or contact an administrator.";
}
