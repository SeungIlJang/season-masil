import { Capacitor } from '@capacitor/core'
import {
  AdMob,
  AdmobConsentStatus,
  BannerAdPluginEvents,
  BannerAdPosition,
  BannerAdSize,
  MaxAdContentRating,
} from '@capacitor-community/admob'

const TEST_BANNER_ID = 'ca-app-pub-3940256099942544/6300978111'
const PRODUCTION_BANNER_ID = 'ca-app-pub-9017259597860535/8999977836'

const configuredBannerId = import.meta.env.VITE_ADMOB_BANNER_ID?.trim()
const liveAdsEnabled = import.meta.env.PROD && import.meta.env.VITE_ADMOB_TEST_MODE !== 'true'

const bannerId = liveAdsEnabled ? configuredBannerId || PRODUCTION_BANNER_ID : TEST_BANNER_ID
const isAndroidApp = Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android'

let initialized = false

// 제스처 바(홈 인디케이터) 높이. viewport-fit=cover 가 있어야 값이 잡힌다.
const readBottomInset = () => {
  const probe = document.createElement('div')
  probe.style.cssText =
    'position:fixed;left:0;bottom:0;width:0;height:env(safe-area-inset-bottom,0px);' +
    'visibility:hidden;pointer-events:none'
  document.body.appendChild(probe)
  const inset = Math.round(probe.getBoundingClientRect().height)
  probe.remove()
  return inset
}

let bottomInset = 0

const setBannerSpace = (height = 0) => {
  const total = height > 0 ? height + bottomInset : 0
  document.documentElement.style.setProperty('--admob-banner-height', `${Math.max(0, total)}px`)
  document.body.classList.toggle('admob-banner-visible', total > 0)
}

export const initializeAds = async () => {
  if (!isAndroidApp || initialized) return false

  bottomInset = readBottomInset()

  try {
    await AdMob.initialize({
      initializeForTesting: !liveAdsEnabled,
      maxAdContentRating: MaxAdContentRating.General,
    })

    let consentInfo = await AdMob.requestConsentInfo()
    if (consentInfo.isConsentFormAvailable && consentInfo.status === AdmobConsentStatus.REQUIRED) {
      consentInfo = await AdMob.showConsentForm()
    }

    initialized = true
    const privacyOptionsRequired = consentInfo.privacyOptionsRequirementStatus === 'REQUIRED'
    if (!consentInfo.canRequestAds) return privacyOptionsRequired

    await AdMob.addListener(BannerAdPluginEvents.SizeChanged, ({ height }) => setBannerSpace(height))
    await AdMob.addListener(BannerAdPluginEvents.FailedToLoad, () => setBannerSpace())

    await AdMob.showBanner({
      adId: bannerId,
      adSize: BannerAdSize.ADAPTIVE_BANNER,
      position: BannerAdPosition.BOTTOM_CENTER,
      margin: bottomInset,
      isTesting: !liveAdsEnabled,
    })

    return privacyOptionsRequired
  } catch {
    setBannerSpace()
    return false
  }
}

export const showAdPrivacyOptions = async () => {
  if (!isAndroidApp || !initialized) return
  await AdMob.showPrivacyOptionsForm()
}

export const adsAreInTestMode = !liveAdsEnabled
