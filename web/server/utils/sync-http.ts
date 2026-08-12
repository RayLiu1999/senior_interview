import {
  createError,
  getHeader,
  getRequestIP,
  setResponseHeader,
} from 'h3'
import type { H3Event } from 'h3'

import {
  consumeSyncRateLimit,
  extractBearerToken,
  getSyncLimits,
  getSyncRateLimitOptions,
} from '../../utils/sync-security'

export function prepareSyncResponse(event: H3Event): void {
  setResponseHeader(event, 'cache-control', 'no-store')
  setResponseHeader(event, 'x-content-type-options', 'nosniff')
  setResponseHeader(event, 'referrer-policy', 'no-referrer')
}

export function enforceSyncRateLimit(event: H3Event): void {
  const clientKey = `sync:${getRequestIP(event) ?? 'unknown'}`
  const result = consumeSyncRateLimit(clientKey, Date.now(), getSyncRateLimitOptions())
  setResponseHeader(event, 'x-ratelimit-limit', String(result.limit))
  setResponseHeader(event, 'x-ratelimit-remaining', String(result.remaining))
  if (!result.allowed) {
    setResponseHeader(event, 'retry-after', result.retryAfterSeconds)
    throw createError({
      statusCode: 429,
      statusMessage: 'Too many sync requests. Try again later.',
    })
  }
}

export function rejectOversizedSyncRequest(event: H3Event): void {
  const contentLength = getHeader(event, 'content-length')
  if (!contentLength) return
  const parsedLength = Number.parseInt(contentLength, 10)
  if (Number.isFinite(parsedLength) && parsedLength > getSyncLimits().maxRequestBytes) {
    throw createError({ statusCode: 413, statusMessage: 'Sync request is too large.' })
  }
}

export function requireJsonSyncRequest(event: H3Event): void {
  const contentType = getHeader(event, 'content-type')
  if (!contentType || !/^application\/json(?:\s*;|$)/i.test(contentType)) {
    throw createError({ statusCode: 415, statusMessage: 'Sync requests must use application/json.' })
  }
}

export function getSyncBearerToken(event: H3Event): string | null {
  const authorization = getHeader(event, 'authorization')
  if (authorization && !extractBearerToken(authorization)) {
    throw createError({ statusCode: 400, statusMessage: 'Authorization must use a bearer token.' })
  }
  return extractBearerToken(authorization)
}
