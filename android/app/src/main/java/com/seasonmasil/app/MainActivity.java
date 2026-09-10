package com.seasonmasil.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        registerPlugin(NativeGeocoderPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
