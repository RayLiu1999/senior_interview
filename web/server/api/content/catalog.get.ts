import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

import { defineEventHandler } from 'h3'
import type { ContentCatalog } from '../../../types/content'

const catalogCandidates = [
  process.env.INTERVIEW_CONTENT_CATALOG,
  join(process.cwd(), 'public', 'content', 'catalog.json'),
  join(process.cwd(), 'web', 'public', 'content', 'catalog.json'),
  join(process.cwd(), '.output', 'public', 'content', 'catalog.json'),
  join(process.cwd(), 'web', '.output', 'public', 'content', 'catalog.json'),
].filter((candidate): candidate is string => Boolean(candidate))

let catalogPromise: Promise<ContentCatalog> | null = null

async function loadCatalog(): Promise<ContentCatalog> {
  const catalogPath = catalogCandidates.find((candidate) => existsSync(candidate))
  if (!catalogPath) throw new Error('Generated content catalog was not found.')
  return JSON.parse(await readFile(catalogPath, 'utf8')) as ContentCatalog
}

export default defineEventHandler(async () => {
  catalogPromise ??= loadCatalog()
  return catalogPromise
})
