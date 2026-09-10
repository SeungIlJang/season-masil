import { Capacitor, registerPlugin } from '@capacitor/core'
import { Geolocation } from '@capacitor/geolocation'
import { canonicalDistrictFor } from '../data/regions'

const NativeGeocoder = registerPlugin('NativeGeocoder')
const isAndroidApp = Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android'

const regionFromAddress = (address) => {
  const text = Object.values(address).filter(Boolean).join(' ')
  if (/서울특별시|\b서울\b/.test(text)) return '서울'
  if (/경기도|\b경기\b/.test(text)) return '경기'
  return ''
}

export const locateAdministrativeArea = async ({ requestPermission = true } = {}) => {
  if (!isAndroidApp) {
    throw new Error('현재 위치 자동 설정은 Android 앱에서 사용할 수 있습니다.')
  }

  let permission = await Geolocation.checkPermissions()
  if (permission.coarseLocation === 'prompt' || permission.coarseLocation === 'prompt-with-rationale') {
    if (!requestPermission) return null
    permission = await Geolocation.requestPermissions({ permissions: ['coarseLocation'] })
  }

  if (permission.coarseLocation !== 'granted') {
    if (!requestPermission) return null
    throw new Error('현재 위치를 사용하려면 위치 권한을 허용해 주세요.')
  }

  const position = await Geolocation.getCurrentPosition({
    enableHighAccuracy: false,
    maximumAge: 5 * 60 * 1000,
    timeout: 12_000,
  })
  const address = await NativeGeocoder.reverseGeocode({
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
  })

  const region = regionFromAddress(address)
  const district = canonicalDistrictFor(region, Object.values(address).filter(Boolean).join(' '))
  if (!region || !district) {
    throw new Error('현재 위치가 서울·경기 지역이 아니거나 행정구역을 확인할 수 없습니다.')
  }

  return { region, district }
}
