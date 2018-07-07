import WaitingEvent from '~/library/WaitingEvent';
import OneSignal from 'react-native-onesignal';
import { Linking, Platform, AsyncStorage } from 'react-native';
import { 
    // NOTIFICATION_IS_SUBSCRIBE, 
    ONESIGNAL_PLAYER_ID, 
    NOTIFICATION_TOKEN, 
    UNREAD_NOTIFICATION_NUMBER,
    AUTH_IDENTITY
} from '~/constants/registryKey';
import trackerService from '~/services/notification/tracker';
import subscriberService from '~/services/notification/subscriber';

export default (Registry) => {

    if( Platform.OS === "android" ) {

        // chuông (Android only)
        OneSignal.enableSound(true);

        // rung (Android only)
        OneSignal.enableVibrate(true);
    } else {
        // // Requesting permissions
        // OneSignal.checkPermissions((permissions) => {
        //     console.log(permissions);
        // });

        // Setting requestPermissions
        OneSignal.requestPermissions({
            alert: true,
            badge: true,
            sound: true
        });

        // Calling registerForPushNotifications
        // OneSignal.registerForPushNotifications();
    }
    
    // khi app đang mở: 0: none, 1: inapp alert, 2: notification
    OneSignal.inFocusDisplaying(2);

    // cho phép nhận
    var isSubscribe = true;
    OneSignal.setSubscription(isSubscribe);
    // Registry.set(NOTIFICATION_IS_SUBSCRIBE, isSubscribe);

    // sự kiện lấy id onesignal
    const idsHandle = e => {
        WaitingEvent.dispatch('OneSignal.ids', e);
        Registry.set(ONESIGNAL_PLAYER_ID, e.userId);
        subscribeNotification();
    };
    OneSignal.removeEventListener('ids', idsHandle);
    OneSignal.addEventListener('ids', idsHandle);

    // sự kiện nhận thông báo
    const receivedHandle = async e => {

        WaitingEvent.dispatch('OneSignal.received', e);

        if (
            e &&
            e.payload &&
            e.payload.notificationID
        ) {

            try {
                // set lại số thông báo chưa đọc
                Registry.set(UNREAD_NOTIFICATION_NUMBER, (Registry.get(UNREAD_NOTIFICATION_NUMBER) * 1 || 0) + 1);

                // gọi lên server notification để xác nhận đã nhận được thông báo
                await trackerService.received(e.payload.notificationID);
            } catch (e) { }
        }
    };
    OneSignal.removeEventListener('received', receivedHandle);
    OneSignal.addEventListener('received', receivedHandle);

    // sự lấy open
    const openedHandle = async e => {

        WaitingEvent.dispatch('OneSignal.opened', e);
        if (
            e &&
            e.notification &&
            e.notification.payload &&
            e.notification.payload.notificationID
        ) {

            try {

                // set lại số thông báo chưa đọc
                const unreadNotification = (Registry.get(UNREAD_NOTIFICATION_NUMBER) * 1 || 0) - 1;
                Registry.set(UNREAD_NOTIFICATION_NUMBER, unreadNotification >= 0 ? unreadNotification : 0);
                
                // gọi lên server notification để xác nhận đã mở thông báo
                await trackerService.opened(e.notification.payload.notificationID);

            } catch (e) {}
        }
    };
    OneSignal.removeEventListener('opened', openedHandle);
    OneSignal.addEventListener('opened', openedHandle);

    // sự kiện linking
    const linkingHandle = e => WaitingEvent.dispatch('Linking.url', e && e.url || "");
    Linking.removeEventListener('url', linkingHandle);
    Linking.addEventListener('url', linkingHandle);

    // request subscribe/unSubscribe
    var requestNotification = null;
    const stopRequestNotification = () => {
        
        if (requestNotification && requestNotification.cancel) {
            requestNotification.cancel();
        }
        requestNotification = undefined;
    };

    // hàm hỗ trợ subscribe notification
    const subscribeNotification = async () => {
        try {
            stopRequestNotification();
            requestNotification = subscriberService.subscrice();
            const res = await requestNotification;
            requestNotification = undefined;
            // if (res.status === 200 && res.data.STATUS === "OK") {

            //     isSubscribe = true;
            // } else {

            //     isSubscribe = false;
            // }
        } catch (error) {
            // isSubscribe = false;
        }
        // OneSignal.setSubscription(isSubscribe);
        // Registry.set(NOTIFICATION_IS_SUBSCRIBE, isSubscribe);

        // try {
        //     AsyncStorage.setItem(NOTIFICATION_IS_SUBSCRIBE, JSON.stringify(isSubscribe));
        // } catch (error) { }

        try {
            requestNotification = trackerService.getUnread();
            await requestNotification;
            requestNotification = undefined;
        } catch (error) {}
    };

    // // sự kiện thay đổi subscribe notification
    // const eventSwitchSubscribe = Registry.addEventListener('change', NOTIFICATION_IS_SUBSCRIBE, async (flag) => {

    //     if (flag == isSubscribe) {
    //         return;
    //     }

    //     if( !flag ) {

    //         try {
                
    //             stopRequestNotification();
    //             requestNotification = subscriberService.unSubscrice();
    //             await requestNotification;
    //             requestNotification = undefined;
    //         } catch (error) {}

    //         isSubscribe = false;
    //         // OneSignal.setSubscription(isSubscribe);
    //         try {
    //             AsyncStorage.setItem(NOTIFICATION_IS_SUBSCRIBE, JSON.stringify(false));
    //         } catch (error) {}
    //         return;
    //     }

    //     subscribeNotification();
    // });

    // sự kiện đăng nhập/ đăng xuất
    const eventChangeAuth = Registry.addEventListener('change', AUTH_IDENTITY, () => {

        // if (isSubscribe) {

            subscribeNotification();
        // }
    });

    // init
    // try {

    //     AsyncStorage.getItem(NOTIFICATION_IS_SUBSCRIBE).then((flag) => {

    //         flag = flag !== null && flag !== undefined ? JSON.parse(flag) : true;
    //         if (flag !== true && flag !== false) {
    //             flag = true;
    //         }
            
    //         // isSubscribe = flag;
    //         isSubscribe = true;
    //         Registry.set(NOTIFICATION_IS_SUBSCRIBE, isSubscribe);
    //     });
    // } catch (error) { }

    return {
        remove: () => {
            Linking.removeEventListener('url', linkingHandle);
            OneSignal.removeEventListener('opened', openedHandle);
            OneSignal.removeEventListener('received', receivedHandle);
            OneSignal.removeEventListener('ids', idsHandle);
            stopRequestNotification();
            // eventSwitchSubscribe && eventSwitchSubscribe.remove();
            eventChangeAuth && eventChangeAuth.remove();
        }
    };
};