import { createError, defineEventHandler, getQuery } from 'h3'

import { findProgress, isValidSyncToken } from '../../utils/progress-store'
import {
  enforceSyncRateLimit,
  getSyncBearerToken,
  prepareSyncResponse,
} from '../../utils/sync-http'

export default defineEventHandler(async (event) => {
  prepareSyncResponse(event)
  enforceSyncRateLimit(event)

  const queryToken = getQuery(event).syncToken
  const bearerToken = getSyncBearerToken(event)
  if (bearerToken && queryToken && bearerToken !== queryToken) {
    throw createError({ statusCode: 400, statusMessage: 'Authorization and syncToken must match.' })
  }
  const token = bearerToken ?? queryToken
  if (!isValidSyncToken(token)) throw createError({ statusCode: 400, statusMessage: 'A valid syncToken is required.' })
  const record = await findProgress(token)
  if (!record) throw createError({ statusCode: 404, statusMessage: 'Progress record not found.' })
  return {
    syncToken: record.syncToken,
    state: record.state,
    updatedAt: record.updatedAt,
  }
})
