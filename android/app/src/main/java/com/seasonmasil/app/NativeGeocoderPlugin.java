package com.seasonmasil.app;

import android.location.Address;
import android.location.Geocoder;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.util.List;
import java.util.Locale;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@CapacitorPlugin(name = "NativeGeocoder")
public class NativeGeocoderPlugin extends Plugin {

    private final ExecutorService executor = Executors.newSingleThreadExecutor();

    @PluginMethod
    public void reverseGeocode(PluginCall call) {
        Double latitude = call.getDouble("latitude");
        Double longitude = call.getDouble("longitude");
        if (latitude == null || longitude == null) {
            call.reject("위도와 경도가 필요합니다.");
            return;
        }
        if (!Geocoder.isPresent()) {
            call.reject("기기에서 주소 변환 서비스를 사용할 수 없습니다.");
            return;
        }

        executor.execute(() -> {
            try {
                Geocoder geocoder = new Geocoder(getContext(), Locale.KOREAN);
                @SuppressWarnings("deprecation")
                List<Address> addresses = geocoder.getFromLocation(latitude, longitude, 1);
                if (addresses == null || addresses.isEmpty()) {
                    call.reject("현재 위치의 행정구역을 확인할 수 없습니다.");
                    return;
                }

                Address address = addresses.get(0);
                JSObject result = new JSObject();
                result.put("adminArea", address.getAdminArea());
                result.put("subAdminArea", address.getSubAdminArea());
                result.put("locality", address.getLocality());
                result.put("subLocality", address.getSubLocality());
                result.put("addressLine", address.getMaxAddressLineIndex() >= 0 ? address.getAddressLine(0) : "");
                call.resolve(result);
            } catch (Exception error) {
                call.reject("현재 위치의 주소를 확인하지 못했습니다.", error);
            }
        });
    }

    @Override
    protected void handleOnDestroy() {
        executor.shutdownNow();
    }
}
