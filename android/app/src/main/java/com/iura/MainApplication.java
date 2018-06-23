package com.teststringee;

import android.app.Application;

import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;

import java.util.Arrays;
import java.util.List;

// lib
import com.facebook.react.ReactApplication;
import com.zmxv.RNSound.RNSoundPackage;
import com.stringeereactnative.RNStringeeReactPackage;
import com.oblador.vectoricons.VectorIconsPackage;
import com.reactnativecomponent.splashscreen.RCTSplashScreenPackage;
import com.geektime.rnonesignalandroid.ReactNativeOneSignalPackage;
import com.imagepicker.ImagePickerPackage;
import co.apptailor.googlesignin.RNGoogleSigninPackage;
// import com.idehub.GoogleAnalyticsBridge.GoogleAnalyticsBridgePackage;
import com.rnfs.RNFSPackage;
import com.RNFetchBlob.RNFetchBlobPackage;
import com.masteratul.exceptionhandler.ReactNativeExceptionHandlerPackage;
import com.learnium.RNDeviceInfo.RNDeviceInfo;
import com.microsoft.codepush.react.CodePush;
import com.centaurwarchief.smslistener.SmsListenerPackage;
import org.reactnative.camera.RNCameraPackage;
import com.airbnb.android.react.maps.MapsPackage;

import com.facebook.CallbackManager;
import com.facebook.reactnative.androidsdk.FBSDKPackage;
import com.facebook.appevents.AppEventsLogger;

import io.invertase.firebase.RNFirebasePackage;
import io.invertase.firebase.analytics.RNFirebaseAnalyticsPackage;
import io.invertase.firebase.fabric.crashlytics.RNFirebaseCrashlyticsPackage;
import io.invertase.firebase.crash.RNFirebaseCrashPackage;
import io.invertase.firebase.database.RNFirebaseDatabasePackage;
import io.invertase.firebase.notifications.RNFirebaseNotificationsPackage;
import io.invertase.firebase.messaging.RNFirebaseMessagingPackage;

import com.zxcpoiu.incallmanager.InCallManagerPackage;
import com.pritesh.calldetection.CallDetectionManager;

// Debugging
import android.os.Bundle;
import okhttp3.OkHttpClient;
import com.facebook.react.modules.network.ReactCookieJarContainer;
import com.facebook.stetho.Stetho;
import com.facebook.react.modules.network.OkHttpClientProvider;
import com.facebook.stetho.okhttp3.StethoInterceptor;
import java.util.concurrent.TimeUnit;

public class MainApplication extends Application implements ReactApplication {

  private static CallbackManager mCallbackManager = CallbackManager.Factory.create();

  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {

    @Override
    protected String getJSBundleFile() {
      return CodePush.getJSBundleFile();
    }
    
    @Override
    public boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    @Override
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(
          new MainReactPackage(),
            new RNSoundPackage(),
            new ReactNativeExceptionHandlerPackage(),
            new RNStringeeReactPackage(),
            new VectorIconsPackage(),
            new RCTSplashScreenPackage(),
            new ReactNativeOneSignalPackage(),
            new ImagePickerPackage(),
            new RNGoogleSigninPackage(),
            // new GoogleAnalyticsBridgePackage(),
            new RNFSPackage(),
            new RNFetchBlobPackage(),
            new FBSDKPackage(mCallbackManager),
            new RNDeviceInfo(),
            new CodePush(BuildConfig.CODEPUSH_KEY, getApplicationContext(), BuildConfig.DEBUG),
            new SmsListenerPackage(),
            new RNFirebasePackage(),
            new RNFirebaseNotificationsPackage(),
            new RNFirebaseMessagingPackage(),
            new RNFirebaseCrashPackage(),
            new RNFirebaseDatabasePackage(),
            new RNFirebaseCrashlyticsPackage(),
            new RNFirebaseAnalyticsPackage(),
            new InCallManagerPackage(),
            new CallDetectionManager(),
            new RNCameraPackage(),
            new MapsPackage()
      );
    }

    @Override
    protected String getJSMainModuleName() {
      return "index";
    }
  };

  protected static CallbackManager getCallbackManager() {
    return mCallbackManager;
  }

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    AppEventsLogger.activateApp(this);
    SoLoader.init(this, /* native exopackage */ false);

    // Debugging
    Stetho.initializeWithDefaults(this);
    OkHttpClient client = new OkHttpClient.Builder()
      .connectTimeout(0, TimeUnit.MILLISECONDS)
      .readTimeout(0, TimeUnit.MILLISECONDS)
      .writeTimeout(0, TimeUnit.MILLISECONDS)
      .cookieJar(new ReactCookieJarContainer())
      .addNetworkInterceptor(new StethoInterceptor())
      .build();
    OkHttpClientProvider.replaceOkHttpClient(client);
  }
}
