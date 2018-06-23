package com.teststringee;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
// import android.os.Bundle;

// import com.facebook.react.HeadlessJsTaskService;
// import com.facebook.react.ReactApplication;
// import com.facebook.react.bridge.Arguments;
// import com.facebook.react.bridge.ReactContext;
// import com.facebook.react.bridge.WritableMap;

// import io.invertase.firebase.Utils;

import android.telephony.TelephonyManager;
import android.widget.Toast;
import java.lang.reflect.Method;

public class CallReceiver extends BroadcastReceiver {
  
  @Override
  public void onReceive(Context context, Intent intent) {
    try {
        String state = intent.getStringExtra(TelephonyManager.EXTRA_STATE);
        String number = intent.getExtras().getString(TelephonyManager.EXTRA_INCOMING_NUMBER);

        if(state.equalsIgnoreCase(TelephonyManager.EXTRA_STATE_RINGING)){

            Toast.makeText(context, "Ring " + number, Toast.LENGTH_SHORT).show();
        }
        if(state.equalsIgnoreCase(TelephonyManager.EXTRA_STATE_OFFHOOK)){

            Toast.makeText(context, "Answered " + number, Toast.LENGTH_SHORT).show();
        }
        if(state.equalsIgnoreCase(TelephonyManager.EXTRA_STATE_IDLE)){

            Toast.makeText(context, "Idle "+ number, Toast.LENGTH_SHORT).show();
        }
    } catch (Exception e) {
        e.printStackTrace();
    }
  }
}
