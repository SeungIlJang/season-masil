import { Capacitor } from '@capacitor/core'
import {
  AdMob,
  AdmobConsentStatus,
  BannerAdPluginEvents,
  BannerAdPosition,
  BannerAdSize,
  InterstitialAdPluginEvents,
  MaxAdContentRating,
} from '@capacitor-community/admob'

const TEST_BANNER_ID = 'ca-app-pub-3940256099942544/6300978111'
const TEST_INTERSTITIAL_ID = 'ca-app-pub-3940256099942544/1033173712'
const INTERSTITIAL_AFTER_DETAIL_OPENS = 5
const INTERSTITIAL_COOLDOWN_MS = 15 * 60 * 1000

const configuredBannerId = import.meta.env.VITE_ADMOB_BANNER_ID?.trim()
const configuredInterstitialId = import.meta.env.VITE_ADMOB_INTERSTITIAL_ID?.trim()
const liveAdsEnabled = import.meta.env.VITE_ADMOB_TEST_MODE === 'false'
  && Boolean(configuredBannerId && configuredInterstitialId)

const bannerId = liveAdsEnabled ? configuredBannerId : TEST_BANNER_ID
const interstitialId = liveAdsEnabled ? configuredInterstitialId : TEST_INTERSTITIAL_ID
const isAndroidApp = Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android'

let initialized = false
let interstitialReady = false
let detailOpenCount = 0
let lastInterstitialAt = 0
let resolveInterstitialFinished = null

const setBannerSpace = (height = 0) => {
  document.documentElement.style.setProperty('--admob-banner-height', `${Math.max(0, height)}px`)
  document.body.classList.toggle('admob-banner-visible', height > 0)
}

const prepareInterstitial = async () => {
  try {
    await AdMob.prepareInterstitial({ adId: interstitialId, isTesting: !liveAdsEnabled })
    interstitialReady = true
  } catch {
    interstitialReady = false
  }
}

export const initializeAds = async () => {
  if (!isAndroidApp || initialized) return false

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
    await AdMob.addListener(InterstitialAdPluginEvents.Dismissed, () => resolveInterstitialFinished?.())
    await AdMob.addListener(InterstitialAdPluginEvents.FailedToShow, () => resolveInterstitialFinished?.())

    await AdMob.showBanner({
      adId: bannerId,
      adSize: BannerAdSize.ADAPTIVE_BANNER,
      position: BannerAdPosition.BOTTOM_CENTER,
      margin: 0,
      isTesting: !liveAdsEnabled,
    })

    void prepareInterstitial()
    return privacyOptionsRequired
  } catch {
    setBannerSpace()
    return false
  }
}

export const maybeShowDetailInterstitial = async () => {
  if (!isAndroidApp || !initialized) return

  detailOpenCount += 1
  const cooldownComplete = Date.now() - lastInterstitialAt >= INTERSTITIAL_COOLDOWN_MS
  if (detailOpenCount < INTERSTITIAL_AFTER_DETAIL_OPENS || !cooldownComplete || !interstitialReady) return

  try {
    interstitialReady = false
    const finished = new Promise((resolve) => {
      resolveInterstitialFinished = resolve
    })
    await AdMob.showInterstitial({ adId: interstitialId })
    await Promise.race([
      finished,
      new Promise((resolve) => window.setTimeout(resolve, 60_000)),
    ])
    resolveInterstitialFinished = null
    detailOpenCount = 0
    lastInterstitialAt = Date.now()
    void prepareInterstitial()
  } catch {
    resolveInterstitialFinished = null
    void prepareInterstitial()
  }
}

export const showAdPrivacyOptions = async () => {
  if (!isAndroidApp || !initialized) return
  await AdMob.showPrivacyOptionsForm()
}

export const adsAreInTestMode = !liveAdsEnabled
