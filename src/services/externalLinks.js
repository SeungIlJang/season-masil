import { Browser } from '@capacitor/browser'
import { Capacitor } from '@capacitor/core'
import { maybeShowDetailInterstitial } from './adMob'

export const openEventDetail = async (url) => {
  if (!url) return

  if (Capacitor.isNativePlatform()) {
    await maybeShowDetailInterstitial()
    await Browser.open({ url })
    return
  }

  window.open(url, '_blank', 'noopener,noreferrer')
}
