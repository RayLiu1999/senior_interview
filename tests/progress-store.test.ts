import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { afterAll, beforeEach, describe, expect, it } from 'vitest'

import { createEmptyProgress } from '../web/utils/progress'

const storeDirectory = await mkdtemp(join(tmpdir(), 'senior-interview-progress-'))
const storePath = join(storeDirectory, 'progress.json')
process.env.INTERVIEW_PROGRESS_STORE = storePath
process.env.INTERVIEW_PROGRESS_RETENTION_DAYS = '1'
process.env.INTERVIEW_PROGRESS_MAX_RECORDS = '2'

const {
  createSyncToken,
  deleteProgress,
  findProgress,
  pruneProgress,
  upsertProgress,
} = await import('../web/server/utils/progress-store')

afterAll(async () => {
  await rm(storeDirectory, { recursive: true, force: true })
  delete process.env.INTERVIEW_PROGRESS_STORE
  delete process.env.INTERVIEW_PROGRESS_RETENTION_DAYS
  delete process.env.INTERVIEW_PROGRESS_MAX_RECORDS
})

beforeEach(async () => {
  await rm(storePath, { force: true })
})

describe('file-backed progress store lifecycle', () => {
  it('writes versioned records with creation metadata and reads them back', async () => {
    const syncToken = createSyncToken()
    const stored = await upsertProgress(syncToken, createEmptyProgress())

    expect(stored.syncToken).toBe(syncToken)
    expect(stored.createdAt).toBe(stored.updatedAt)
    expect((await findProgress(syncToken))?.state.syncToken).toBe(syncToken)

    const file = JSON.parse(await readFile(storePath, 'utf8')) as { version: number; records: Record<string, { createdAt: string }> }
    expect(file.version).toBe(2)
    expect(file.records[syncToken].createdAt).toBe(stored.createdAt)
  })

  it('upgrades a version-one record while preserving its state', async () => {
    const syncToken = createSyncToken()
    const updatedAt = new Date(Date.now() - 12 * 60 * 60 * 1_000).toISOString()
    await writeFile(storePath, JSON.stringify({
      version: 1,
      records: {
        [syncToken]: { syncToken, state: { ...createEmptyProgress(), syncToken }, updatedAt },
      },
    }), 'utf8')

    const stored = await findProgress(syncToken)
    expect(stored?.createdAt).toBe(updatedAt)
    expect(stored?.updatedAt).toBe(updatedAt)
    expect(stored?.state.syncToken).toBe(syncToken)
  })

  it('supports explicit deletion and removes expired records', async () => {
    const syncToken = createSyncToken()
    await upsertProgress(syncToken, createEmptyProgress())
    expect(await deleteProgress(syncToken)).toBe(true)
    expect(await deleteProgress(syncToken)).toBe(false)

    const expiringToken = createSyncToken()
    await upsertProgress(expiringToken, createEmptyProgress())
    expect(await pruneProgress(new Date(Date.now() + 2 * 24 * 60 * 60 * 1_000))).toBe(1)
    expect(await findProgress(expiringToken)).toBeNull()
  })

  it('keeps the configured maximum number of records', async () => {
    await upsertProgress(createSyncToken(), createEmptyProgress())
    await upsertProgress(createSyncToken(), createEmptyProgress())
    const newestToken = createSyncToken()
    await upsertProgress(newestToken, createEmptyProgress())

    const file = JSON.parse(await readFile(storePath, 'utf8')) as { records: Record<string, unknown> }
    expect(Object.keys(file.records)).toHaveLength(2)
    expect(Object.keys(file.records)).toContain(newestToken)
  })
})
