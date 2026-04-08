import { NextResponse } from 'next/server';

type ApiErrorCode =
  | 'AUTH_REQUIRED'
  | 'FORBIDDEN'
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'STATE_TRANSITION_NOT_ALLOWED'
  | 'RESOURCE_LOCKED'
  | 'RATE_LIMITED'
  | 'INTERNAL_ERROR';

function buildMeta() {
  return {
    requestId: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
  };
}

export function apiOk<T>(data: T, status = 200) {
  return NextResponse.json(
    {
      ok: true,
      data,
      meta: buildMeta(),
    },
    { status },
  );
}

export function apiError(
  code: ApiErrorCode,
  message: string,
  status: number,
  details: unknown[] = [],
) {
  return NextResponse.json(
    {
      ok: false,
      error: {
        code,
        message,
        details,
      },
      meta: buildMeta(),
    },
    { status },
  );
}

export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}
