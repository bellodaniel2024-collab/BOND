/**
 * BOND — Standardized API Response Utilities
 *
 * SECURITY:
 * - Error messages never expose internal stack traces to clients.
 * - Server-side errors logged internally; client receives generic message.
 */
import { NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { formatZodErrors } from './validation'
import { AuthenticationError, AuthorizationError } from './session'

export interface ApiSuccessResponse<T> {
  success: true
  data: T
  message?: string
}

export interface ApiErrorResponse {
  success: false
  error: string
  errors?: Array<{ field: string; message: string }>
  code?: string
}

// ─── Success Response ─────────────────────────────────────────────────────────

export function apiSuccess<T>(
  data: T,
  message?: string,
  status = 200,
): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json({ success: true, data, message }, { status })
}

// ─── Error Responses ──────────────────────────────────────────────────────────

export function apiError(
  message: string,
  status = 400,
  code?: string,
): NextResponse<ApiErrorResponse> {
  return NextResponse.json({ success: false, error: message, code }, { status })
}

export function apiValidationError(
  errors: Array<{ field: string; message: string }>,
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    {
      success: false,
      error: 'Validation failed.',
      errors,
    },
    { status: 422 },
  )
}

// ─── Error Handler ────────────────────────────────────────────────────────────

/**
 * Converts thrown errors to appropriate API responses.
 * Never exposes internal error details to the client.
 */
export function handleApiError(
  error: unknown,
  context: string,
): NextResponse<ApiErrorResponse> {
  // Log full error server-side (never send to client)
  console.error(`[API Error] ${context}:`, error)

  if (error instanceof ZodError) {
    return apiValidationError(formatZodErrors(error))
  }

  if (error instanceof AuthenticationError) {
    return apiError('Authentication required.', 401, 'UNAUTHENTICATED')
  }

  if (error instanceof AuthorizationError) {
    return apiError('Access denied.', 403, 'UNAUTHORIZED')
  }

  if (error instanceof RateLimitError) {
    return apiError(
      'Too many requests. Please try again later.',
      429,
      'RATE_LIMITED',
    )
  }

  if (error instanceof ValidationError) {
    return apiError(error.message, 400, 'VALIDATION_ERROR')
  }

  // Generic internal server error — do not expose details
  return apiError('An internal error occurred.', 500, 'INTERNAL_ERROR')
}

// ─── Custom Errors ────────────────────────────────────────────────────────────

export class RateLimitError extends Error {
  constructor(public retryAfterMs?: number) {
    super('Rate limit exceeded.')
    this.name = 'RateLimitError'
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

export class BlockchainError extends Error {
  constructor(message: string, public code?: string) {
    super(message)
    this.name = 'BlockchainError'
  }
}

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'NotFoundError'
  }
}
