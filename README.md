# Hotfix
- react-navigation-redux-helpers
> https://github.com/react-navigation/react-navigation-redux-helpers/pull/37/commits/6a05e8cc887814f60200dced3058b637267ac2e0    
> node_modules/react-navigation-redux-helpers/src/middleware.js    

- android crash react-native-incall-manager    
> react-native-incall-manager/android/src/main/java/com/zxcpoiu/incallmanager/AppRTC/AppRTCBluetoothManager.java    
> bố sung try catch ở chỗ apprtcContext.unregisterReceiver(receiver);   

> react-native-incall-manager/android/src/main/java/com/zxcpoiu/incallmanager/InCallManagerModule.java    
> hàm ReactMethod stop    
> trong if thêm stopProximitySensor(); và setKeepScreenOn(false);    
> kéo hàm stopEvents(); lên đầu của else if để stop các event cảm biến trước    

- react-native-call-detection
> fix lại android java, chuyển lại callback thành event    
> bổ sung hàm lấy trạng thái hiện tại   

# sound find
> https://www.soundsnap.com/tags/phone_ring    
> https://mp3cut.net/    
> https://mediacollege.com/audio/tone/download/    

# link version find
> https://docs.fabric.io/android/changelog.html    
> https://firebase.google.com/support/release-notes/android    
> https://developer.android.com/studio/releases/gradle-plugin    
> https://services.gradle.org/distributions/    
> https://firebase.google.com/docs/perf-mon/get-started-android    
> https://firebase.google.com/docs/android/setup    
> https://rnfirebase.io    

# follow
> https://stackoverflow.com/questions/4787249/how-to-capture-the-new-intent-in-onnewintent    
> https://stackoverflow.com/questions/44071308/react-native-animate-shrinking-header-with-tabs    
- bundle js
> react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle