import 'server-only'

import fs from 'node:fs'
import path from 'node:path'
import dotenv from 'dotenv'

type EnsureEnvResult = {
  loaded: boolean
  missing: string[]
}

const ENV_FILES = [
  '.env',
  '.env.local',
  '.env.production',
  '.env.production.local',
]

export function ensureRuntimeEnv(keys: string[]): EnsureEnvResult {
  const missingBefore = keys.filter((key) => !process.env[key])
  if (missingBefore.length === 0) {
    return { loaded: false, missing: [] }
  }

  for (const filename of ENV_FILES) {
    const filepath = path.join(process.cwd(), filename)
    if (!fs.existsSync(filepath)) continue
    try {
      const parsed = dotenv.parse(fs.readFileSync(filepath))
      for (const [key, value] of Object.entries(parsed)) {
        if (!process.env[key]) {
          process.env[key] = value
        }
      }
    } catch (error) {
      console.error(`Failed to load ${filename}:`, error)
    }
  }

  const missingAfter = keys.filter((key) => !process.env[key])
  return { loaded: true, missing: missingAfter }
}
