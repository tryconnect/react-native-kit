import { NativeEventEmitter, Platform, NativeModules } from 'react-native';
import TaskManager from '../../Support/TaskManager';
import EventManager from '../../Support/EventManager';

class StringeeClient {

    constructor() {

        this._isDestroy = false;

        // quản lý task
        this._taskManager = new TaskManager();

        // quản lý event
        this._eventManager = new EventManager(new NativeEventEmitter(RNStringeeClient));
    }

    /**
     * @todo hàm connect stringee
     * @param string token
     * @param function callback(error, res)
     * @return Promise
     */
    connect = (token, callback) => {

        return new Promise(async (resolve, reject) => {

            // event connect thành công
            let eventSuccess = null;
            // event connect thất bại
            let eventError = null;
            // event connect thất bại
            let eventDisconnect = null;

            // huỷ sự kiện
            const remove = () => {
                eventSuccess
                    && eventSuccess.remove
                    && eventSuccess.remove()
                ;
                eventError
                    && eventError.remove
                    && eventError.remove()
                ;
                eventDisconnect
                    && eventDisconnect.remove
                    && eventDisconnect.remove()
                ;
            };

            try {

                // listen sự kiện connect thành công
                eventSuccess = this.addListener("onConnect", (e) => {

                    // huỷ sự kiện
                    remove();

                    // call back
                    callback && callback(null, e);
                    resolve(e);
                });

                // listen sự kiện connect thất bại
                eventError = this.addListener("onFailWithError", (e) => {

                    // huỷ sự kiện
                    remove();

                    // call back
                    callback && callback(e);
                    reject(e);
                });

                // listen sự kiện connect thất bại
                eventDisconnect = this.addListener("onDisConnect", (e) => {

                    // huỷ sự kiện
                    remove();

                    // call back
                    callback && callback(e);
                    reject(e);
                });

                // disconnect
                // try {

                //     this.disconnect();
                // } catch (error) {}

                // connect
                RNStringeeClient.connect(token);
            } catch (error) {

                // huỷ sự kiện
                remove();

                // call back
                callback && callback(error);
                reject(error);
            }
        });
    };

    /**
     * @todo hàm ngắt kết nối stringee
     * @param function callback(error)
     * @return Promise
     */
    disconnect = (callback) => {

        return new Promise((resolve, reject) => {

            // sự kiện disconnect thành công
            let eventDisconnect = null;
            // huỷ sự kiện
            const remove = () => {
                eventDisconnect
                    && eventDisconnect.remove
                    && eventDisconnect.remove()
                ;
            };

            try {

                // listen sự kiện disconnect
                eventDisconnect = this.addListener("onDisConnect", (e) => {

                    // huỷ sự kiện
                    remove();

                    // callback
                    callback && callback(null, e);
                    resolve(e);
                });

                // ngắt kết nối
                RNStringeeClient.disconnect();
            } catch (error) {

                // huỷ sự kiện
                remove();

                callback && callback(error);
                reject(error);
            }
        });
    };

    /**
     * @todo hàm đăng ký nhận notification
     * @param string deviceToken: token từ firebase
     * @param boolean isProduction: environment
     * @param boolean isVoip
     * @param function callback
     */
    registerPush = (deviceToken, isProduction, isVoip, callback) => {

        callback = this._taskManager.addTask(callback);
        if (Platform.OS == "ios") {

            return RNStringeeClient.registerPushForDeviceToken(deviceToken, isProduction, isVoip, callback);
        } else {

            return RNStringeeClient.registerPushToken(deviceToken, callback);
        }
    };

    /**
     * @todo hàm huỷ đăng ký notification
     * @param string deviceToken: token từ firebase
     * @param function callback
     */
    unregisterPush = (deviceToken, callback) => {

        callback = this._taskManager.addTask(callback);
        return RNStringeeClient.unregisterPushToken(deviceToken, callback);
    };

    /**
     * @todo Hàm listen sự kiện
     * @param string eventName: tên sự kiện
     * @param function handle: handle xử lý
     * @return event
     */
    addListener = (eventName, handle, ...args) => {

        // chuyển đổi event name
        eventName = ClientEvents[eventName];

        // listen sự kiện
        return this._eventManager.addListener(eventName, handle, ...args);
    };

    /**
     * @todo hàm huỷ tất cả sự kiện
     */
    removeAllListeners = () => {

        return this._eventManager.removeAllListeners();
    };

    /**
     * @todo hàm huỷ tất cả task (callback)
     */
    stopAllTasks = () => {

        return this._taskManager.stopAllTasks();
    };

    /**
     * @todo hàm huỷ toàn bộ sự kiện, task
     */
    destroy = () => {

        this._isDestroy = true;

        this._taskManager.destroy();
        this._eventManager.destroy();
    };
}

const RNStringeeClient = NativeModules.RNStringeeClient;

// mapping event
const ClientEvents = Platform.select({
    ios: {
        onConnect: "didConnect",
        onDisConnect: "didDisConnect",
        onFailWithError: "didFailWithError",
        onRequestAccessToken: "requestAccessToken",
        onIncomingCall: "incomingCall"
    },
    android: {
        onConnect: "onConnectionConnected",
        onDisConnect: "onConnectionDisconnected",
        onFailWithError: "onConnectionError",
        onRequestAccessToken: "onRequestNewToken",
        onIncomingCall: "onIncomingCall"
    }
});

StringeeClient.EVENTS = ClientEvents;

if (Platform.OS == "android") {
    RNStringeeClient.init();
}

Object.keys(ClientEvents).forEach((key) => {

    RNStringeeClient.setNativeEvent(ClientEvents[key]);
});

export default StringeeClient;