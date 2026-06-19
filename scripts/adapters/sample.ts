import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import type { RawTobacco, SourceAdapter } from './types'

const here = dirname(fileURLToPath(import.meta.url))

// Заглушка: читает локальный raw/sample.json.
// Когда появится реальный источник — добавь рядом новый адаптер (id, fetchAll)
// и зарегистрируй его в build-catalog.ts. Приложение трогать не нужно.
export const sampleAdapter: SourceAdapter = {
  id: 'sample',
  async fetchAll(): Promise<RawTobacco[]> {
    const raw = await readFile(join(here, '..', 'raw', 'sample.json'), 'utf8')
    return JSON.parse(raw) as RawTobacco[]
  },
}
