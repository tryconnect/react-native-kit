import { NativeEventEmitter, NativeModules } from 'react-native';
import TaskManager from '../../Support/TaskManager';
import EventManager from '../../Support/EventManager';
import { CallEvents } from './events';

class StringeeCall {

    constructor() {

        this._isDestroy = false;

        // quản lý task
        this._taskManager = new TaskManager();

        // quản lý event
        this._eventManager = new EventManager(new NativeEventEmitter(RNStringeeCall));
    }

    /**
     * @todo hàm khởi tạo cuộc gọi
     * @param parameters
     * @param function callback
     * @return Promise
     */
    makeCall = (parameters, callback) => {

        return new Promise((resolve, reject) => {

            try {
                if (typeof parameters !== "string") {

                    parameters = JSON.stringify(parameters);
                }

                // map callback để sử dụng resolve promise
                let handle = (status, code, message, callId) => {

                    callback && callback(status, code, message, callId);
                    resolve({
                        status,
                        code,
                        message,
                        callId
                    });
                };

                // add vào task list để destroy
                handle = this._taskManager.addTask(handle, (cancelable) => {

                    reject(cancelable);
                }, true);
                RNStringeeCall.makeCall(parameters, handle);
            } catch (error) {

                reject(error);
            }
        });
    };

    /**
     * @todo hàm khởi tạo nhận cuộc gọi đến
     * @param string callId: mã cuộc gọi
     * @return Promise
     */
    initAnswer = (callId, callback) => {

        return new Promise((resolve, reject) => {

            try {

                // map callback để sử dụng resolve promise
                let handle = (status, code, message) => {

                    callback && callback(status, code, message);
                    resolve({
                        status,
                        code,
                        message
                    });
                };

                // add vào task list để destroy
                handle = this._taskManager.addTask(handle, (cancelable) => {

                    reject(cancelable);
                }, true);

                RNStringeeCall.initAnswer(callId, handle);
            } catch (error) {

                reject(error);
            }
        });
    };

    /**
     * @todo hàm bắt máy cuộc gọi đến
     * @param string callID: mã cuộc gọi
     * @param function callback
     * @return Promise
     */
    answer = (callId, callback) => {

        return new Promise((resolve, reject) => {

            try {
                // map callback để sử dụng resolve promise
                let handle = (status, code, message) => {

                    callback && callback(status, code, message);
                    resolve({
                        status,
                        code,
                        message
                    });
                };

                // add vào task list để destroy
                handle = this._taskManager.addTask(handle, (cancelable) => {

                    reject(cancelable);
                }, true);

                RNStringeeCall.answer(callId, handle);
            } catch (error) {

                reject(error);
            }
        });
    };

    /**
     * @todo hàm kết thúc cuộc gọi
     * @param string callId: mã cuộc gọi
     * @param function callback
     * @return Promise
     */
    hangup = (callId, callback) => {

        return new Promise((resolve, reject) => {

            try {
                // map callback để sử dụng resolve promise
                let handle = (status, code, message) => {

                    callback && callback(status, code, message);
                    resolve({
                        status,
                        code,
                        message
                    });
                };

                // add vào task list để destroy
                handle = this._taskManager.addTask(handle, (cancelable) => {

                    reject(cancelable);
                }, true);

                RNStringeeCall.hangup(callId, handle);
            } catch (error) {

                reject(error);
            }
        });
    };

    /**
     * @todo Hàm huỷ cuộc gọi đến (không bắt máy)
     * @param string callId: mã cuộc gọi
     * @param function callback
     * @return Promise
     */
    reject = (callId, callback) => {

        return new Promise((resolve, reject) => {

            try {
                // map callback để sử dụng resolve promise
                let handle = (status, code, message) => {

                    callback && callback(status, code, message);
                    resolve({
                        status,
                        code,
                        message
                    });
                };

                // add vào task list để destroy
                handle = this._taskManager.addTask(handle, (cancelable) => {

                    reject(cancelable);
                }, true);

                RNStringeeCall.reject(callId, handle);
            } catch (error) {

                reject(error);
            }
        });
    };

    /**
     * @todo hàm send phone-pad
     * @param string callId: mã cuộc gọi
     * @param function callback
     * @return Promise
     */
    sendDTMF = (callId, dtmf, callback) => {

        return new Promise((resolve, reject) => {

            try {
                // map callback để sử dụng resolve promise
                let handle = (status, code, message) => {

                    callback && callback(status, code, message);
                    resolve({
                        status,
                        code,
                        message
                    });
                };

                // add vào task list để destroy
                handle = this._taskManager.addTask(handle, (cancelable) => {

                    reject(cancelable);
                }, true);
                RNStringeeCall.sendDTMF(callId, dtmf, handle);
            } catch (error) {
                reject(error);
            }
        });
    };

    /**
     * @todo Hàm gửi thông tin qua lại
     * @param string callId: mã cuộc gọi
     * @param string json info: thông tin
     * @param function callback
     * @return Promise
     */
    sendCallInfo = (callId, callInfo, callback) => {

        return new Promise((resolve, reject) => {

            try {
                // map callback để sử dụng resolve promise
                let handle = (status, code, message) => {

                    callback && callback(status, code, message);
                    resolve({
                        status,
                        code,
                        message
                    });
                };

                // add vào task list để destroy
                handle = this._taskManager.addTask(handle, (cancelable) => {

                    reject(cancelable);
                }, true);
                RNStringeeCall.sendCallInfo(callId, callInfo, handle);
            } catch (error) {
                reject(error);
            }
        });
    };

    /**
     * @todo hàm lấy trạng thái cuộc gọi
     * @param string callId: mã cuộc gọi
     * @param function callback
     * @return Promise
     */
    getCallStats = (callId, callback) => {

        return new Promise((resolve, reject) => {

            try {
                // map callback để sử dụng resolve promise
                let handle = (status, code, message, stats) => {

                    callback && callback(status, code, message, stats);
                    resolve({
                        status,
                        code,
                        message,
                        stats
                    });
                };

                // add vào task list để destroy
                handle = this._taskManager.addTask(handle, (cancelable) => {

                    reject(cancelable);
                }, true);
                RNStringeeCall.getCallStats(callId, handle);
            } catch (error) {
                reject(error);
            }
        });
    };

    /**
     * @todo hàm chuyển đổi camera trước hoặc sau
     * @param string callId: mã cuộc gọi
     * @param function callback
     * @return Promise
     */
    switchCamera = (callId, callback) => {

        return new Promise((resolve, reject) => {

            try {
                // map callback để sử dụng resolve promise
                let handle = (status, code, message) => {

                    callback && callback(status, code, message);
                    resolve({
                        status,
                        code,
                        message
                    });
                };

                // add vào task list để destroy
                handle = this._taskManager.addTask(handle, (cancelable) => {

                    reject(cancelable);
                }, true);
                RNStringeeCall.switchCamera(callId, handle);
            } catch (error) {
                reject(error);
            }
        });
    };

    /**
     * @todo Hàm bật tắt video
     * @param string callId: mã cuộc gọi
     * @param boolean enabled: trạng thái
     * @param function callback
     * @return Promise
     */
    enableVideo = (callId, enabled, callback) => {

        return new Promise((resolve, reject) => {

            try {
                // map callback để sử dụng resolve promise
                let handle = (status, code, message) => {

                    callback && callback(status, code, message);
                    resolve({
                        status,
                        code,
                        message
                    });
                };

                // add vào task list để destroy
                handle = this._taskManager.addTask(handle, (cancelable) => {

                    reject(cancelable);
                }, true);
                RNStringeeCall.enableVideo(callId, enabled, handle);
            } catch (error) {
                reject(error);
            }
        });
    };

    /**
     * @todo hàm tắt mic
     * @param string callId: mã cuộc gọi
     * @param function callback
     * @return Promise
     */
    mute = (callId, mute, callback) => {

        return new Promise((resolve, reject) => {

            try {
                // map callback để sử dụng resolve promise
                let handle = (status, code, message) => {

                    callback && callback(status, code, message);
                    resolve({
                        status,
                        code,
                        message
                    });
                };

                // add vào task list để destroy
                handle = this._taskManager.addTask(handle, (cancelable) => {

                    reject(cancelable);
                }, true);

                RNStringeeCall.mute(callId, mute, handle);
            } catch (error) {
                reject(error);
            }
        });
    };

    /**
     * @todo hàm set loa ngoài
     * @param string callId: mã cuộc gọi
     * @param boolean on: tắt/mở
     * @param function callback
     * @return Promise
     */
    setSpeakerphoneOn = (callId, on, callback) => {

        return new Promise((resolve, reject) => {

            try {
                // map callback để sử dụng resolve promise
                let handle = (status, code, message) => {

                    callback && callback(status, code, message);
                    resolve({
                        status,
                        code,
                        message
                    });
                };

                // add vào task list để destroy
                handle = this._taskManager.addTask(handle, (cancelable) => {

                    reject(cancelable);
                }, true);

                RNStringeeCall.setSpeakerphoneOn(callId, on, handle);
            } catch (error) {
                reject(error);
            }
        });
    };

    /**
     * @todo Hàm listen sự kiện
     * @param string eventName: tên sự kiện
     * @param function handle: handle xử lý
     * @return event
     */
    addListener = (eventName, handle, ...args) => {

        // chuyển đổi event name
        eventName = CallEvents[eventName];

        // listen sự kiện
        return this._eventManager.addListener(eventName, handle, ...args);
    };

    /**
     * @todo hàm huỷ tất cả sự kiện
     */
    removeAllListeners = () => {

        this._eventManager.removeAllListeners();
    };

    /**
     * @todo hàm huỷ tất cả task (callback)
     */
    stopAllTasks = () => {

        this._taskManager.stopAllTasks();
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

const RNStringeeCall = NativeModules.RNStringeeCall;

Object.keys(CallEvents).forEach((key) => {

    RNStringeeCall.setNativeEvent(CallEvents[key]);
});

export default StringeeCall;