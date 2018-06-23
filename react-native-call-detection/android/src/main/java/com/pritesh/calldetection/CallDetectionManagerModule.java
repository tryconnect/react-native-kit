package com.pritesh.calldetection;

import android.app.Activity;
import android.app.Application;
import android.content.Context;
// import android.os.Bundle;
import android.support.annotation.Nullable;
import android.telephony.PhoneStateListener;
import android.telephony.TelephonyManager;
// import android.util.Log;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

// import java.util.HashMap;
// import java.util.Map;

import android.content.pm.PackageManager;
import android.Manifest.permission;

import com.facebook.react.modules.core.PermissionAwareActivity;
import com.facebook.react.modules.core.PermissionListener;
import android.util.SparseArray;
import android.os.Build;
import android.os.Process;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactContext;

public class CallDetectionManagerModule extends 
    ReactContextBaseJavaModule implements 
    PermissionListener
{
    private final SparseArray<Callback> mCallbacks;
    private int mRequestCode = 0;
    private final String GRANTED = "granted";
    private final String DENIED = "denied";
    private final String NEVER_ASK_AGAIN = "never_ask_again";

    private final String PHONE_STATE_EVENT_NAME = "PhoneState";

    // trạng thái cuộc gọi
    private int mCallState = TelephonyManager.CALL_STATE_IDLE;

    private ReactApplicationContext reactContext;
    private TelephonyManager telephonyManager = null;
    private PhoneStateListener phoneStateListener;

    public CallDetectionManagerModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;

        mCallbacks = new SparseArray<Callback>();
    }

    @Override
    public String getName() {
        return "CallDetectionManager";
    }

    private String handleCallState(int state) {
        
        String result = "IDLE";

        switch (mCallState) {

            case TelephonyManager.CALL_STATE_IDLE:
            default:
                if (state == TelephonyManager.CALL_STATE_OFFHOOK) {
                    // Log.d("state", "idle --> off hook = new outgoing call");
                    // idle --> off hook = new outgoing call
                    
                    result = "Connected";
                } else if (state == TelephonyManager.CALL_STATE_RINGING) {
                    // Log.d("state", "idle --> ringing = new incoming call");
                    // idle --> ringing = new incoming call
                    
                    result = "Incoming";
                } else if(state == TelephonyManager.CALL_STATE_IDLE) {

                    result = "IDLE";
                }
                break;

            case TelephonyManager.CALL_STATE_OFFHOOK:
                if (state == TelephonyManager.CALL_STATE_IDLE) {
                    // Log.d("state", "off hook --> idle  = disconnected");
                    // off hook --> idle  = disconnected

                    result = "Disconnected";
                } else if (state == TelephonyManager.CALL_STATE_RINGING) {
                    // Log.d("state", "off hook --> ringing = another call waiting");
                    // off hook --> ringing = another call waiting
                    
                    result = "Incoming";
                } else if(state == TelephonyManager.CALL_STATE_OFFHOOK){
                    // Log.d("state", "off hook --> off hook = another call answer");
                    // off hook --> off hook = another call answer

                    result = "Connected";
                }

                break;

            case TelephonyManager.CALL_STATE_RINGING:
                if (state == TelephonyManager.CALL_STATE_OFFHOOK) {
                    // Log.d("state", "ringing --> off hook = received");
                    // ringing --> off hook = received
                    
                    return "Connected";
                } else if (state == TelephonyManager.CALL_STATE_IDLE) {
                    // Log.d("state", "ringing --> idle = missed call");
                    // ringing --> idle = missed call
                    
                    result = "Missed";
                } else if(state == TelephonyManager.CALL_STATE_RINGING) {
                    // Log.d("state", "ringing --> ringing = another call ringing");
                    // ringing --> ringing = another call ringing

                    result = "Incoming";
                }
                break;
        }

        return result;
    }

    @ReactMethod
    public void startListener(final Promise promise) {

        requestPermission(permission.READ_PHONE_STATE, new Promise() {

            @Override
            public void resolve(@Nullable Object value) {

                if(value != GRANTED) {

                    promise.reject("Permistion denied", new Exception("Permistion denied"));
                    return;
                }

                try {

                    TelephonyManager telephonyManager = getTelephonyManager();
                    if(phoneStateListener != null) {

                        mCallState = telephonyManager.getCallState();
                        promise.resolve(generateData(mCallState, null));
                        return;
                    }

                    phoneStateListener = new PhoneStateListener() {
                        @Override
                        public void onCallStateChanged(int state, String incomingNumber) {
                            
                            try {

                                sendEvent(PHONE_STATE_EVENT_NAME, generateData(state, incomingNumber));
                                mCallState = state;
                            } catch( Exception e ) {}
                        }
                    };
                    telephonyManager.listen(phoneStateListener, PhoneStateListener.LISTEN_CALL_STATE);
                    
                    mCallState = telephonyManager.getCallState();
                    promise.resolve(generateData(mCallState, null));
                } catch(Exception e) {

                    promise.reject("Error listen read phone state", e);
                }
            }

            @Override
            public void reject(String code, Throwable e) {

                promise.reject(code, e);
            }

            /**
            * Report an error which wasn't caused by an exception.
            */
            @Override
            public void reject(String code, String message) {
                promise.reject(code, message);
            }

            /**
            * Report an exception with a custom error message.
            */
            @Override
            public void reject(String code, String message, Throwable e) {
                promise.reject(code, message, e);
            }

            /**
            * Report an error which wasn't caused by an exception.
            * @deprecated Prefer passing a module-specific error code to JS.
            *             Using this method will pass the error code "EUNSPECIFIED".
            */
            @Override
            @Deprecated
            public void reject(String message) {
                promise.reject(message);
            }

            /**
            * Report an exception, with default error code.
            * Useful in catch-all scenarios where it's unclear why the error occurred.
            */
            @Override
            public void reject(Throwable reason) {
                promise.reject(reason);
            }
        });
    }

    @ReactMethod
    public void stopListener(final Promise promise) {
        try {

            if( phoneStateListener == null ) {

                promise.resolve(false);
                return;
            }
            telephonyManager.listen(phoneStateListener, PhoneStateListener.LISTEN_NONE);
            phoneStateListener = null;

            promise.resolve(true);
        } catch(Exception e) {

            promise.reject("stopListener error", e);
        }
    }

    @ReactMethod
    public void getCallState(final Promise promise) {
        requestPermission(permission.READ_PHONE_STATE, new Promise() {

            @Override
            public void resolve(@Nullable Object value) {

                if(value != GRANTED) {

                    promise.reject("Permistion denied", new Exception("Permistion denied"));
                    return;
                }

                try {

                    TelephonyManager telephonyManager = getTelephonyManager();
                    int state = telephonyManager.getCallState();
                    promise.resolve(generateData(state, null));
                    mCallState = state;
                } catch(Exception e) {

                    promise.reject("Error getCallState", e);
                }
            }

            @Override
            public void reject(String code, Throwable e) {

                promise.reject(code, e);
            }

            /**
            * Report an error which wasn't caused by an exception.
            */
            @Override
            public void reject(String code, String message) {
                promise.reject(code, message);
            }

            /**
            * Report an exception with a custom error message.
            */
            @Override
            public void reject(String code, String message, Throwable e) {
                promise.reject(code, message, e);
            }

            /**
            * Report an error which wasn't caused by an exception.
            * @deprecated Prefer passing a module-specific error code to JS.
            *             Using this method will pass the error code "EUNSPECIFIED".
            */
            @Override
            @Deprecated
            public void reject(String message) {
                promise.reject(message);
            }

            /**
            * Report an exception, with default error code.
            * Useful in catch-all scenarios where it's unclear why the error occurred.
            */
            @Override
            public void reject(Throwable reason) {
                promise.reject(reason);
            }
        });
    }

    /**
     * @todo Hàm trả về class TelephonyManager
     */
    private TelephonyManager getTelephonyManager() {

        if(this.telephonyManager == null) {

            this.telephonyManager = (TelephonyManager) this.reactContext.getSystemService(Context.TELEPHONY_SERVICE);
        }

        return this.telephonyManager;
    }

    /**
    * Check if the app has the permission given. successCallback is called with true if the
    * permission had been granted, false otherwise. See {@link Activity#checkSelfPermission}.
    */
    @ReactMethod
    public void checkPermission(final String permission, final Promise promise) {
        try {

            if(_checkPermission(permission)) {

                promise.resolve(GRANTED);
                return;
            }

            promise.resolve(DENIED);
        } catch( Exception e) {

            promise.reject("Error checkPermission", e);
        }
    }

    /**
    * Request the given permission. successCallback is called with true if the permission had been
    * granted, false otherwise. For devices before Android M, this instead checks if the user has
    * the permission given or not.
    * See {@link Activity#checkSelfPermission}.
    */
    @ReactMethod
    public void requestPermission(final String permission, final Promise promise) {

        try {

            if(_checkPermission(permission)) {
                
                promise.resolve(GRANTED);
                return;
            } else if( Build.VERSION.SDK_INT < Build.VERSION_CODES.M ){

                promise.resolve(DENIED);
                return;
            }

            PermissionAwareActivity activity = getPermissionAwareActivity();

            mCallbacks.put(
                mRequestCode, 
                new Callback() {

                    @Override
                    public void invoke(Object... args) {

                        int[] results = (int[]) args[0];

                        if (results.length > 0 && results[0] == PackageManager.PERMISSION_GRANTED) {
                            promise.resolve(GRANTED);
                        } else {
                            PermissionAwareActivity activity = (PermissionAwareActivity) args[1];
                            if (activity.shouldShowRequestPermissionRationale(permission)) {
                                promise.resolve(DENIED);
                            } else {
                                promise.resolve(NEVER_ASK_AGAIN);
                            }
                        }
                    }
                }
            );

            activity.requestPermissions(new String[]{permission}, mRequestCode, this);
            mRequestCode++;
        } catch (IllegalStateException e) {

            promise.reject("ERROR INVALID ACTIVITY", e);
        } catch(Exception e) {

            promise.reject("ERROR Request permistion", e);
        }
    }

    /**
    * Check whether the app should display a message explaining why a certain permission is needed.
    * successCallback is called with true if the app should display a message, false otherwise.
    * This message is only displayed if the user has revoked this permission once before, and if the
    * permission dialog will be shown to the user (the user can choose to not be shown that dialog
    * again). For devices before Android M, this always returns false.
    * See {@link Activity#shouldShowRequestPermissionRationale}.
    */
    @ReactMethod
    public void shouldShowRequestPermissionRationale(final String permission, final Promise promise) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.M) {
            promise.resolve(false);
            return;
        }
        try {
            promise.resolve(getPermissionAwareActivity().shouldShowRequestPermissionRationale(permission));
        } catch (IllegalStateException e) {

            promise.reject("ERROR INVALID ACTIVITY", e);
        }
    }

    /**
    * Method called by the activity with the result of the permission request.
    */
    @Override
    public boolean onRequestPermissionsResult( int requestCode, String[] permissions, int[] grantResults ) {

        mCallbacks.get(requestCode).invoke(grantResults, getPermissionAwareActivity());
        mCallbacks.remove(requestCode);
        return mCallbacks.size() == 0;
    }

    private PermissionAwareActivity getPermissionAwareActivity() {
        Activity activity = getCurrentActivity();
        if (activity == null) {
            throw new IllegalStateException("Tried to use permissions API while not attached to an " + "Activity.");
        } else if (!(activity instanceof PermissionAwareActivity)) {
            throw new IllegalStateException("Tried to use permissions API but the host Activity doesn't" + " implement PermissionAwareActivity.");
        }
        return (PermissionAwareActivity) activity;
    }

    /**
     * @todo Hàm trigger sự kiện
     */
    private void sendEvent(final String eventName, @Nullable WritableMap params) {
        try {
            ReactContext reactContext = getReactApplicationContext();
            if (reactContext != null && reactContext.hasActiveCatalystInstance()) {

                reactContext
                        .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                        .emit(eventName, params);
            }
        } catch (RuntimeException e) {}
    }

    /**
     * @todo Hàm kiểm tra quyền
     */
    private Boolean _checkPermission(final String permission) {

        Context context = getReactApplicationContext().getBaseContext();
        Boolean granted = false;
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.M) {

            if(context.checkPermission(permission, Process.myPid(), Process.myUid()) == PackageManager.PERMISSION_GRANTED) {
                granted = true;
            }
        } else if(context.checkSelfPermission(permission) == PackageManager.PERMISSION_GRANTED) {

            granted = true;
        }
        
        return granted;
    }

    private WritableMap generateData(final int state, @Nullable String incomingNumber) {

        if(incomingNumber == null) {

            TelephonyManager telephonyManager = getTelephonyManager();
            incomingNumber = telephonyManager.getLine1Number();
        }
        WritableMap data = Arguments.createMap();
        data.putInt("status", state);
        data.putInt("prevStatus", mCallState);
        data.putString("state", handleCallState(state));
        data.putString("incomingNumber", incomingNumber);
        return data;
    }
}
