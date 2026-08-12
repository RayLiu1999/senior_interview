import { createError, defineEventHandler } from 'h3'

import { deleteProgress, isValidSyncToken } from '../../utils/progress-store'
import {
  enforceSyncRateLimit,
  getSyncBearerToken,
  prepareSyncResponse,
} from '../../utils/sync-http'

export default defineEventHandler(async (event) => {
  prepareSyncResponse(event)
  enforceSyncRateLimit(event)

  const token = getSyncBearerToken(event)
  if (!isValidSyncToken(token)) {
    throw createError({ statusCode: 400, statusMessage: 'A valid bearer syncToken is required.' })
  }

  return { deleted: await deleteProgress(token) }
})
