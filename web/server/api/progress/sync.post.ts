import { createError, defineEventHandler, readBody } from 'h3'

import {
  createSyncToken,
  isValidSyncToken,
  upsertProgress,
} from '../../utils/progress-store'
import {
  enforceSyncRateLimit,
  getSyncBearerToken,
  prepareSyncResponse,
  rejectOversizedSyncRequest,
  requireJsonSyncRequest,
} from '../../utils/sync-http'
import { validateSyncState } from '~/utils/sync-security'

export default defineEventHandler(async (event) => {
  prepareSyncResponse(event)
  enforceSyncRateLimit(event)
  rejectOversizedSyncRequest(event)
  requireJsonSyncRequest(event)

  const body = await readBody<{ syncToken?: unknown; state?: unknown }>(event)
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw createError({ statusCode: 400, statusMessage: 'Request body must be an object.' })
  }

  const requestedToken = body?.syncToken
  if (requestedToken !== undefined && requestedToken !== null && !isValidSyncToken(requestedToken)) {
    throw createError({ statusCode: 400, statusMessage: 'syncToken must be a UUID.' })
  }
  if (!body?.state || typeof body.state !== 'object') {
    throw createError({ statusCode: 400, statusMessage: 'state is required.' })
  }

  const bearerToken = getSyncBearerToken(event)
  if (bearerToken && requestedToken && bearerToken !== requestedToken) {
    throw createError({ statusCode: 400, statusMessage: 'Authorization and syncToken must match.' })
  }
  if (bearerToken && !isValidSyncToken(bearerToken)) {
    throw createError({ statusCode: 400, statusMessage: 'Authorization bearer token must be a UUID.' })
  }

  const validation = validateSyncState(body.state)
  if (!validation.ok) {
    throw createError({ statusCode: validation.statusCode, statusMessage: validation.reason })
  }

  const syncToken = bearerToken || (isValidSyncToken(requestedToken) ? requestedToken : createSyncToken())
  const record = await upsertProgress(syncToken, validation.state)
  return {
    syncToken: record.syncToken,
    state: record.state,
    updatedAt: record.updatedAt,
  }
})
