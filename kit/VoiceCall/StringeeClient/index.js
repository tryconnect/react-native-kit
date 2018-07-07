import { NativeModules } from 'react-native'
import TaskManager from '../../Support/TaskManager';
import RNStringeeClient from './StringeeClient';
import checkPermissions from '../checkPermissions';
import CallManager from '../CallManager';

const DEFAULT_CONFIGS = {
    autoCheckPermissions: true,
    permistionRationale: {},
    permissionDeniedCallback: () => {}
};

class StringeeClient {

    constructor(options = {}) {

        this.options = {
            ...DEFAULT_CONFIGS,
            ...options,
            permistionRationale: options.permistionRationale || {}
        };

        this._taskManager = new TaskManager();
        this._mapping = new RNStringeeClient();

        // sự kiện nhận cuộc gọi
        this._eventIncomingCall = null;

        if (this.options.autoCheckPermissions) {

            this._taskManager.addTask(checkPermissions(false, false, this.options.permistionRationale, this.options.permissionDeniedCallback));
        }
    }

    /**
     * @todo hàm connect stringee
     * @param string token
     * @param function callback(error, res)
     * @return Promise
     */
    connect = (token, callback) => {

        return new Promise(async (resolve, reject) => {

            try {
                
                await CallManager.configure({
                    permissionDeniedCallback: this.options.permissionDeniedCallback,
                    permistionRationale: this.options.permistionRationale.phoneState
                });
                
                this._mapping.connect(token, this._taskManager.addTask((err, res) => {

                    // nếu kết nối thành công
                    // nếu có tự động check quyền
                    // bắt sự kiện nhận cuộc gọi và check quyền
                    if (
                        this.options.autoCheckPermissions
                        && !err
                        && !this._eventIncomingCall
                    ) {

                        this._eventIncomingCall = this.addListener("onIncomingCall", (e) => {

                            this._taskManager.addTask(checkPermissions(false, false, this.options.permistionRationale, this.options.permissionDeniedCallback));
                        });
                    }

                    callback && callback(err, res);
                    if(err) {
                        return reject(err);
                    }
                    resolve(res);
                }, (cancelable) => {

                    reject(cancelable);
                }, true));

            } catch (error) {

                callback && callback(error);
                reject(error);
            }
        });
    }

    /**
     * @todo hàm ngắt kết nối stringee
     * @param function callback(error)
     * @return Promise
     */
    disconnect = (callback) => {

        this._eventIncomingCall 
            && this._eventIncomingCall.remove 
            && this._eventIncomingCall.remove()
        ;
        return this._mapping.disconnect(callback);
    };

    /**
     * @todo hàm đăng ký nhận notification
     * @param string deviceToken: token từ firebase
     * @param boolean isProduction: environment
     * @param boolean isVoip
     * @param function callback
     */
    registerPush = (deviceToken, isProduction, isVoip, callback) => {

        return this._mapping.registerPush(deviceToken, isProduction, isVoip, callback);
    };

    /**
     * @todo hàm huỷ đăng ký notification
     * @param string deviceToken: token từ firebase
     * @param function callback
     */
    unregisterPush = (deviceToken, callback) => {

        return this._mapping.unregisterPush(deviceToken, callback);
    };

    /**
     * @todo Hàm listen sự kiện
     * @param string eventName: tên sự kiện
     * @param function handle: handle xử lý
     * @return event
     */
    addListener = (eventName, handle, ...args) => {

        // nếu là event có cuộc gọi đến
        if (eventName == "onIncomingCall") {

            let rootHandle = handle;

            // fix handle event
            handle = (e) => {
                
                // lấy cuộc gọi hiện tại
                let currentCallId = CallManager.getCurrentHandle();

                // nếu có cuộc gọi
                if ( currentCallId ) {
                    
                    // lấy thông tin cuộc gọi
                    let callInfo = CallManager.getCallInfo(currentCallId) || {};

                    // nếu cuộc gọi là GSM
                    // hoặc cuộc gọi vẫn chưa bắt máy
                    // hoặc cuộc gọi đang được gọi tạo và cuộc gọi đến không phải số đt đang gọi đi
                    if( 
                        CallManager.isGSMCall(currentCallId)
                        || (
                            !CallManager.isInitCall(currentCallId)
                            && !callInfo.answered
                        ) 
                        || (
                            CallManager.isInitCall(currentCallId)
                            && callInfo.to != e.from
                        )
                    ) {

                        // huỷ cuộc gọi
                        return RNStringeeCall.reject(e.callId, () => {});
                    }
                }

                rootHandle && rootHandle(e);
            };
        }
        return this._mapping.addListener(eventName, handle, ...args);
    };

    /**
     * @todo hàm huỷ tất cả sự kiện
     */
    removeAllListeners = () => {

        this._eventIncomingCall
            && this._eventIncomingCall.remove
            && this._eventIncomingCall.remove()
        ;
        return this._mapping.removeAllListeners();
    };

    /**
     * @todo hàm huỷ tất cả task (callback)
     */
    stopAllTasks = () => {

        this._taskManager.stopAllTasks();
        this._mapping.stopAllTasks();
    };

    /**
     * @todo hàm huỷ toàn bộ sự kiện, task
     */
    destroy = () => {

        this._isDestroy = true;

        this._eventIncomingCall
            && this._eventIncomingCall.remove
            && this._eventIncomingCall.remove()
        ;

        this._taskManager.destroy();
        this._mapping.destroy();
    };
}

const RNStringeeCall = NativeModules.RNStringeeCall;

StringeeClient.EVENTS = RNStringeeClient.EVENTS;

export default StringeeClient;