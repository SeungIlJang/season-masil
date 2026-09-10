import fs from 'node:fs'
import { spawnSync } from 'node:child_process'

const roots = process.argv.slice(2)
const envPath = new URL('../.env.local', import.meta.url)

if (!fs.existsSync(envPath)) {
  console.log('인증키 검사: .env.local 없음 (검사 생략)')
  process.exit(0)
}

const entries = fs.readFileSync(envPath, 'utf8')
  .split(/\r?\n/)
  .filter((line) => line && !line.trim().startsWith('#'))
  .map((line) => {
    const index = line.indexOf('=')
    const name = index < 0 ? line : line.slice(0, index)
    const value = index < 0 ? '' : line.slice(index + 1).trim().replace(/^['"]|['"]$/g, '')
    return [name, value]
  })
  .filter(([, value]) => value.length >= 8)

const leaked = new Set()
for (const [name, value] of entries) {
  for (const root of roots) {
    if (!fs.existsSync(root)) continue
    const result = spawnSync('rg', ['-a', '-l', '--fixed-strings', '--', value, root])
    if (result.status === 0) leaked.add(name)
  }
}

if (leaked.size) {
  console.error(`인증키 검사 실패: ${leaked.size}개 환경변수 값이 산출물에 포함됐습니다.`)
  process.exit(1)
}

console.log('인증키 검사: 통과')
