import { createError, defineEventHandler, getQuery } from 'h3'

import { findProgress, isValidSyncToken } from '../../utils/progress-store'

export default defineEventHandler(async (event) => {
  const token = getQuery(event).syncToken
  if (!isValidSyncToken(token)) throw createError({ statusCode: 400, statusMessage: 'A valid syncToken is required.' })
  const record = await findProgress(token)
  if (!record) throw createError({ statusCode: 404, statusMessage: 'Progress record not found.' })
  return {
    syncToken: record.syncToken,
    state: record.state,
    updatedAt: record.updatedAt,
  }
})
