package com.teststringee;

import com.facebook.react.ReactActivity;

// import com.zxcpoiu.incallmanager.InCallManagerPackage;

// wakeLock
import android.app.KeyguardManager;
import android.app.KeyguardManager.KeyguardLock;
import android.content.Context;
import android.os.PowerManager;
import android.view.WindowManager;
import android.os.Bundle;

import com.reactnativecomponent.splashscreen.RCTSplashScreen;
import android.widget.ImageView;

import android.content.Intent;

import android.app.Activity;
import android.util.Log;

public class MainActivity extends ReactActivity {

    private static Activity instance = null;
    private static PowerManager.WakeLock wakeLock = null;
    private static KeyguardManager.KeyguardLock keyguardLock = null;

    /**
     * Returns the name of the main component registered from JavaScript.
     * This is used to schedule rendering of the component.
     */
    @Override
    protected String getMainComponentName() {
        return BuildConfig.COMPONENT_NAME;
    }

    @Override
    public void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        // MainApplication.getCallbackManager().onActivityResult(requestCode, resultCode, data);
    }

    @Override
    public void onCreate(Bundle savedInstanceState) {
        //RCTSplashScreen.openSplashScreen(this);   //open splashscreen
	    RCTSplashScreen.openSplashScreen(this, true, ImageView.ScaleType.FIT_XY);   //open splashscreen fullscreen
	    super.onCreate(savedInstanceState);
        
        instance = this;
        
        wakeLock();
        if(isKeyguardLocked()) {

            disableKeyguard();
        }
    }

    @Override
    public void onResume() {
        super.onResume();
        
        if(
            wakeLock != null
            && wakeLock.isHeld()
        ){
            wakeLock.release();
        }
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        instance = null;
        keyguardLock = null;

        if(
            wakeLock != null
            && wakeLock.isHeld()
        ){
            wakeLock.release();
            wakeLock = null;
        }
    }

    /**
     * @todo Hàm bỏ qua mở khoá màn hình
     */
    public static void disableKeyguard() {

        try {

            if(instance == null) {
                return;
            }

            if(keyguardLock == null) {

                keyguardLock = ((KeyguardManager) instance.getApplicationContext()
                                                        .getSystemService(Context.KEYGUARD_SERVICE))
                                                        .newKeyguardLock(Context.KEYGUARD_SERVICE)
                ;
            }

            keyguardLock.disableKeyguard();
        } catch(Exception e) {
            // Log.d("MainActivity", "disableKeyguard failed");
        } 
    }

    /**
     * @todo Hàm khoá màn hình
     */
    public static void reenableKeyguard() {

        try {

            if(instance == null) {
                return;
            }

            if(keyguardLock == null) {

                keyguardLock = ((KeyguardManager) instance.getApplicationContext()
                                                        .getSystemService(Context.KEYGUARD_SERVICE))
                                                        .newKeyguardLock(Context.KEYGUARD_SERVICE)
                ;
            }
            
            keyguardLock.reenableKeyguard();

            if(
                wakeLock != null
                && wakeLock.isHeld()
            ){
                wakeLock.release();
            }
        } catch(Exception e) {
            // Log.d("MainActivity", "reenableKeyguard failed");
        } 
    }

    /**
     * @todo Hàm check có phải màn hình đang bị khoá
     */
    public static boolean isKeyguardLocked() {

        try {

            if(instance == null) {
                return false;
            }

            KeyguardManager keyguardManager = (KeyguardManager) instance.getApplicationContext()
                                                .getSystemService(Context.KEYGUARD_SERVICE)
            ;

            if( keyguardManager.inKeyguardRestrictedInputMode()) {

                return true;
            }
        } catch(Exception e) {
            // Log.d("MainActivity", "disableKeyguard failed");
        } 

        return false;
    }

    /**
     * @todo Hàm đánh thức điện thoại
     */
    public static void wakeLock() {

        try {

            if(instance == null) {
                return;
            }

            PowerManager powerManager = ((PowerManager) instance.getApplicationContext()
                                    .getSystemService(Context.POWER_SERVICE))
            ;
            wakeLock = powerManager.newWakeLock(
                PowerManager.SCREEN_BRIGHT_WAKE_LOCK |
                PowerManager.FULL_WAKE_LOCK | 
                PowerManager.ACQUIRE_CAUSES_WAKEUP
                , instance.getLocalClassName()
            );

            wakeLock.acquire();

            instance.getWindow().addFlags(
                WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED |
                    WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD |
                    WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON |
                    WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON
            );
        } catch(Exception e) {
            // Log.d("MainActivity", "wakeLock failed");
        } 
    }

    // @Override
    // public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
    //     super.onRequestPermissionsResult(requestCode, permissions, grantResults);
    //     InCallManagerPackage.onRequestPermissionsResult(requestCode, permissions, grantResults);
    // }
}
