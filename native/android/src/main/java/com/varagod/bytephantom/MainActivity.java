package com.varagod.bytephantom;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(NetworkRadarPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
