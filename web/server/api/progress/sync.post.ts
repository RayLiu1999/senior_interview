import { createError, defineEventHandler, readBody } from 'h3'

import {
  createSyncToken,
  isValidSyncToken,
  upsertProgress,
} from '../../utils/progress-store'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ syncToken?: unknown; state?: unknown }>(event)
  const requestedToken = body?.syncToken
  if (requestedToken !== undefined && requestedToken !== null && !isValidSyncToken(requestedToken)) {
    throw createError({ statusCode: 400, statusMessage: 'syncToken must be a UUID.' })
  }
  if (!body?.state || typeof body.state !== 'object') {
    throw createError({ statusCode: 400, statusMessage: 'state is required.' })
  }

  const syncToken = isValidSyncToken(requestedToken) ? requestedToken : createSyncToken()
  const record = await upsertProgress(syncToken, body.state)
  return {
    syncToken: record.syncToken,
    state: record.state,
    updatedAt: record.updatedAt,
  }
})
