package com.teststringee;

import android.content.Intent;
import android.support.v4.content.LocalBroadcastManager;
import android.util.Log;

import com.facebook.react.HeadlessJsTaskService;
import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;

// import com.stringeereactnative.StringeeManager;
// import com.stringee.StringeeClient;

import io.invertase.firebase.Utils;
import org.json.JSONException;
import org.json.JSONObject;

public class RNFirebaseMessagingService extends FirebaseMessagingService {
  private static final String TAG = "RNFMessagingService";
  public static final String MESSAGE_EVENT = "messaging-message";
  public static final String REMOTE_NOTIFICATION_EVENT = "notifications-remote-notification";

  @Override
  public void onMessageReceived(RemoteMessage message) {
    Log.d(TAG, "onMessageReceived event received");

    if (message.getNotification() != null) {
      // It's a notification, pass to the Notifications module
      Intent notificationEvent = new Intent(REMOTE_NOTIFICATION_EVENT);
      notificationEvent.putExtra("notification", message);

      // Broadcast it to the (foreground) RN Application
      LocalBroadcastManager.getInstance(this).sendBroadcast(notificationEvent);
    } else {

      // cờ check được push từ Stringee
      Boolean pushFromStringee = false;

      // trạng thái cuộc gọi Stringee
      String callStatus = null;

      // trạng thái cuộc gọi là started
      Boolean isCallStarted = false;

      try {

        if (message.getData().get("stringeePushNotification") != null) { // Receive push notification from Stringee Server
          
          pushFromStringee = true;
          String data = message.getData().get("data");

          // parse call status
          JSONObject jsonObject = new JSONObject(data);
          callStatus = jsonObject.getString("callStatus");

          // kiểm tra trạng thái cuộc gọi
          if(callStatus != null && callStatus.equals("started")) {

            isCallStarted = true;
          }

          // đánh thức màn hình
          MainActivity.wakeLock();

          // nếu trạng thái là bắt đầu cuộc gọi và đang trong màn hình khoá
          if(isCallStarted && MainActivity.isKeyguardLocked()) {

            // mở màn hình
            MainActivity.disableKeyguard();
          }
        }
      } catch(Exception e) {

        Log.d(TAG, "Stringee Exception detect");
      }
      
      // It's a data message
      // If the app is in the foreground we send it to the Messaging module
      if (Utils.isAppInForeground(this.getApplicationContext())) {

        Intent messagingEvent = new Intent(MESSAGE_EVENT);
        messagingEvent.putExtra("message", message);
        // Broadcast it so it is only available to the RN Application
        LocalBroadcastManager.getInstance(this).sendBroadcast(messagingEvent);

      } else {

        try {

          // nếu được push từ Stringee và trạng thái cuộc gọi là start
          if(isCallStarted) {

            // StringeeClient client = StringeeManager.getInstance().getClient();

            // if (client == null || !client.isConnected()) {

                // khởi tạo lại app
                Intent intent = new Intent(getApplicationContext(), MainActivity.class);
                intent.addFlags(
                  Intent.FLAG_ACTIVITY_CLEAR_TOP | 
                  Intent.FLAG_ACTIVITY_TASK_ON_HOME |
                  Intent.FLAG_ACTIVITY_SINGLE_TOP |
                  Intent.FLAG_ACTIVITY_REORDER_TO_FRONT |
                  Intent.FLAG_ACTIVITY_NEW_TASK
                );

                startActivity(intent);
                
                Intent messagingEvent = new Intent(MESSAGE_EVENT);
                messagingEvent.putExtra("message", message);
                
                // Broadcast it so it is only available to the RN Application
                LocalBroadcastManager.getInstance(this).sendBroadcast(messagingEvent);
                return;
            // }
          }

          // If the app is in the background we send it to the Headless JS Service
          Intent headlessIntent = new Intent(this.getApplicationContext(), RNFirebaseBackgroundMessagingService.class);
          headlessIntent.putExtra("message", message);
          
          this.getApplicationContext().startService(headlessIntent);
          HeadlessJsTaskService.acquireWakeLockNow(this.getApplicationContext());

        } /*catch (IllegalStateException ex) {

          // Log.e(TAG, "Background messages will only work if the message priority is set to 'high'", ex);
        } */catch(Exception e) {

        }
      }
    }
  }
}
