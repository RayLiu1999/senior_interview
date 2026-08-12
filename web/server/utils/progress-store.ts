import { randomUUID } from 'node:crypto'
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'

import type { ProgressState } from '~/types/content'
import { createEmptyProgress, normalizeProgress } from '~/utils/progress'
import { mergeProgressStates } from '~/utils/sync'

export interface StoredProgress {
  syncToken: string
  state: ProgressState
  updatedAt: string
}

interface ProgressFile {
  version: 1
  records: Record<string, StoredProgress>
}

const storePath = process.env.INTERVIEW_PROGRESS_STORE
  ?? join(process.cwd(), '.data', 'progress.json')
let operationQueue = Promise.resolve()

function withStoreLock<T>(operation: () => Promise<T>): Promise<T> {
  const result = operationQueue.then(operation, operation)
  operationQueue = result.then(() => undefined, () => undefined)
  return result
}

async function readStore(): Promise<ProgressFile> {
  try {
    const serialized = await readFile(storePath, 'utf8')
    const parsed = JSON.parse(serialized) as Partial<ProgressFile>
    if (parsed.version !== 1 || !parsed.records || typeof parsed.records !== 'object') throw new Error('Invalid progress store format.')
    return { version: 1, records: parsed.records as Record<string, StoredProgress> }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return { version: 1, records: {} }
    throw error
  }
}

async function writeStore(store: ProgressFile): Promise<void> {
  await mkdir(dirname(storePath), { recursive: true })
  const temporaryPath = `${storePath}.${process.pid}.${Date.now()}.tmp`
  await writeFile(temporaryPath, JSON.stringify(store), 'utf8')
  await rename(temporaryPath, storePath)
}

export function createSyncToken(): string {
  return randomUUID()
}

export function isValidSyncToken(value: unknown): value is string {
  return typeof value === 'string' && /^[a-f0-9-]{36}$/i.test(value)
}

export async function upsertProgress(syncToken: string, incoming: unknown): Promise<StoredProgress> {
  return withStoreLock(async () => {
    const store = await readStore()
    const current = store.records[syncToken]
    const incomingState = normalizeProgress(incoming)
    const merged = current
      ? mergeProgressStates(current.state, incomingState)
      : mergeProgressStates(createEmptyProgress(), incomingState)
    const updatedAt = new Date().toISOString()
    const record: StoredProgress = {
      syncToken,
      state: { ...merged, syncToken, updatedAt },
      updatedAt,
    }
    store.records[syncToken] = record
    await writeStore(store)
    return record
  })
}

export async function findProgress(syncToken: string): Promise<StoredProgress | null> {
  return withStoreLock(async () => {
    const store = await readStore()
    return store.records[syncToken] ?? null
  })
}
