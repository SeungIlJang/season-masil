import { Browser } from '@capacitor/browser'
import { Capacitor } from '@capacitor/core'

export const openEventDetail = async (url) => {
  if (!url) return

  if (Capacitor.isNativePlatform()) {
    await Browser.open({ url })
    return
  }

  window.open(url, '_blank', 'noopener,noreferrer')
}
