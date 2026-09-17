import { Capacitor } from '@capacitor/core'
import { CapacitorUpdater } from '@capgo/capacitor-updater'

const UPDATE_ORIGIN = 'https://seungiljang.github.io'
const UPDATE_PATH = '/season-masil/live-update/'
const MANIFEST_URL = `${UPDATE_ORIGIN}${UPDATE_PATH}manifest.json`
const CHECK_TIMEOUT_MS = 7000

const fetchManifest = async () => {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), CHECK_TIMEOUT_MS)

  try {
    const response = await fetch(`${MANIFEST_URL}?t=${Date.now()}`, {
      cache: 'no-store',
      signal: controller.signal,
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return await response.json()
  } finally {
    clearTimeout(timer)
  }
}

const validateManifest = (manifest) => {
  if (!manifest || typeof manifest.version !== 'string') return false
  if (!/^web-[a-f0-9]{16}$/.test(manifest.version)) return false
  if (!/^[a-f0-9]{64}$/.test(manifest.checksum || '')) return false

  try {
    const url = new URL(manifest.url)
    return url.origin === UPDATE_ORIGIN && url.pathname.startsWith(UPDATE_PATH)
  } catch {
    return false
  }
}

export async function startLiveUpdate() {
  if (!Capacitor.isNativePlatform()) return

  try {
    await CapacitorUpdater.notifyAppReady()

    const manifest = await fetchManifest()
    if (!validateManifest(manifest)) throw new Error('잘못된 업데이트 정보')

    const [{ bundle: current }, queued] = await Promise.all([
      CapacitorUpdater.current(),
      CapacitorUpdater.getNextBundle(),
    ])

    if (current.version === manifest.version || queued?.version === manifest.version) return

    const bundle = await CapacitorUpdater.download({
      version: manifest.version,
      url: manifest.url,
      checksum: manifest.checksum,
    })

    await CapacitorUpdater.next({ id: bundle.id })
    console.info(`[update] ${manifest.version} 다운로드 완료, 다음 실행 시 적용`)
  } catch (error) {
    console.info('[update] 확인 생략:', error?.message || error)
  }
}
