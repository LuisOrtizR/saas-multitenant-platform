// ── Base ──────────────────────────────────────────────────────────────────────

export class BaseError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly message: string,
    public readonly code: string,
    public readonly expose = true
  ) {
    super(message)
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
  }
}

// ── 4xx ──────────────────────────────────────────────────────────────────────

export class BadRequestError extends BaseError {
  constructor(message = "Bad request", code = "BAD_REQUEST") {
    super(400, message, code)
  }
}

export class UnauthorizedError extends BaseError {
  constructor(message = "Unauthorized", code = "UNAUTHORIZED") {
    super(401, message, code)
  }
}

export class PaymentRequiredError extends BaseError {
  constructor(message = "Plan limit reached", code = "PLAN_LIMIT_EXCEEDED") {
    super(402, message, code)
  }
}

export class ForbiddenError extends BaseError {
  constructor(message = "Forbidden", code = "FORBIDDEN") {
    super(403, message, code)
  }
}

export class NotFoundError extends BaseError {
  constructor(message = "Resource not found", code = "NOT_FOUND") {
    super(404, message, code)
  }
}

export class ConflictError extends BaseError {
  constructor(message = "Conflict", code = "CONFLICT") {
    super(409, message, code)
  }
}

// ── 5xx ──────────────────────────────────────────────────────────────────────

export class InternalError extends BaseError {
  constructor(message = "Internal server error", code = "INTERNAL_ERROR") {
    super(500, message, code, false)
  }
}