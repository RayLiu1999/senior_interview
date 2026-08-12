import { randomUUID } from 'node:crypto'
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'

import type { ProgressState } from '../../types/content'
import { createEmptyProgress, normalizeProgress } from '../../utils/progress'
import { mergeProgressStates } from '../../utils/sync'

export interface StoredProgress {
  syncToken: string
  state: ProgressState
  createdAt: string
  updatedAt: string
}

interface ProgressFile {
  version: 2
  records: Record<string, StoredProgress>
}

export interface ProgressStoreConfig {
  retentionDays: number
  maxRecords: number
}

const storePath = process.env.INTERVIEW_PROGRESS_STORE
  ?? join(process.cwd(), '.data', 'progress.json')
let operationQueue = Promise.resolve()

function withStoreLock<T>(operation: () => Promise<T>): Promise<T> {
  const result = operationQueue.then(operation, operation)
  operationQueue = result.then(() => undefined, () => undefined)
  return result
}

function environmentInteger(name: string, fallback: number, minimum: number, maximum: number): number {
  const raw = process.env[name]
  const parsed = raw ? Number.parseInt(raw, 10) : Number.NaN
  return Number.isInteger(parsed) && parsed >= minimum && parsed <= maximum ? parsed : fallback
}

export function getProgressStoreConfig(): ProgressStoreConfig {
  return {
    retentionDays: environmentInteger('INTERVIEW_PROGRESS_RETENTION_DAYS', 365, 1, 3_650),
    maxRecords: environmentInteger('INTERVIEW_PROGRESS_MAX_RECORDS', 10_000, 1, 1_000_000),
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function validTimestamp(value: unknown, fallback: string): string {
  if (typeof value !== 'string' || !Number.isFinite(Date.parse(value))) return fallback
  return value
}

function normalizeStoredRecord(key: string, value: unknown): StoredProgress | null {
  if (!isRecord(value)) return null
  const syncToken = isValidSyncToken(key)
    ? key
    : (isValidSyncToken(value.syncToken) ? value.syncToken : null)
  if (!syncToken) return null

  const fallbackTimestamp = new Date(0).toISOString()
  const updatedAt = validTimestamp(value.updatedAt, fallbackTimestamp)
  const createdAt = validTimestamp(value.createdAt, updatedAt)
  const state = normalizeProgress(value.state)
  return {
    syncToken,
    state: { ...state, syncToken, updatedAt },
    createdAt,
    updatedAt,
  }
}

async function readStore(): Promise<ProgressFile> {
  try {
    const serialized = await readFile(storePath, 'utf8')
    const parsed = JSON.parse(serialized) as { version?: unknown; records?: unknown }
    if ((parsed.version !== 1 && parsed.version !== 2) || !isRecord(parsed.records)) {
      throw new Error('Invalid progress store format.')
    }

    const records: Record<string, StoredProgress> = {}
    for (const [key, value] of Object.entries(parsed.records)) {
      const record = normalizeStoredRecord(key, value)
      if (record) records[record.syncToken] = record
    }
    return { version: 2, records }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return { version: 2, records: {} }
    throw error
  }
}

async function writeStore(store: ProgressFile): Promise<void> {
  await mkdir(dirname(storePath), { recursive: true, mode: 0o700 })
  const temporaryPath = `${storePath}.${process.pid}.${Date.now()}.tmp`
  await writeFile(temporaryPath, JSON.stringify(store), { encoding: 'utf8', mode: 0o600 })
  await rename(temporaryPath, storePath)
}

function pruneRecords(
  records: Record<string, StoredProgress>,
  now: Date,
  config: ProgressStoreConfig,
  preferredSyncToken?: string,
): number {
  const before = Object.keys(records).length
  const cutoff = now.getTime() - config.retentionDays * 24 * 60 * 60 * 1_000

  for (const [syncToken, record] of Object.entries(records)) {
    if (Date.parse(record.updatedAt) < cutoff) delete records[syncToken]
  }

  const newestRecords = Object.entries(records)
    .sort((left, right) => {
      const updatedAtDifference = Date.parse(right[1].updatedAt) - Date.parse(left[1].updatedAt)
      if (updatedAtDifference !== 0) return updatedAtDifference
      if (left[0] === preferredSyncToken) return -1
      if (right[0] === preferredSyncToken) return 1
      return right[0].localeCompare(left[0])
    })
    .slice(0, config.maxRecords)
  const retainedTokens = new Set(newestRecords.map(([syncToken]) => syncToken))
  for (const syncToken of Object.keys(records)) {
    if (!retainedTokens.has(syncToken)) delete records[syncToken]
  }
  return before - Object.keys(records).length
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
      createdAt: current?.createdAt ?? updatedAt,
      updatedAt,
    }
    store.records[syncToken] = record
    pruneRecords(store.records, new Date(updatedAt), getProgressStoreConfig(), syncToken)
    await writeStore(store)
    return record
  })
}

export async function findProgress(syncToken: string): Promise<StoredProgress | null> {
  return withStoreLock(async () => {
    const store = await readStore()
    const removed = pruneRecords(store.records, new Date(), getProgressStoreConfig())
    if (removed > 0) await writeStore(store)
    return store.records[syncToken] ?? null
  })
}

export async function deleteProgress(syncToken: string): Promise<boolean> {
  return withStoreLock(async () => {
    const store = await readStore()
    const deleted = Boolean(store.records[syncToken])
    if (!deleted) return false
    delete store.records[syncToken]
    await writeStore(store)
    return true
  })
}

export async function pruneProgress(now = new Date()): Promise<number> {
  return withStoreLock(async () => {
    const store = await readStore()
    const removed = pruneRecords(store.records, now, getProgressStoreConfig())
    if (removed > 0) await writeStore(store)
    return removed
  })
}
