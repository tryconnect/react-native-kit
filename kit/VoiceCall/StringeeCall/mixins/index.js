import InCallManager from '../../InCallManager';
import { InCallManagerEvents, ClockEvents } from '../events';
import {
    comfirmRequestEventName,
    comfirmAnswerEventName,
    generateRequestComfirm,
    generateAnswerComfirm,
    generateCallInfoHandle
} from '../utils/generateCallInfoHandle';
import Sound from 'react-native-sound';
import init from './init';

export default function(){

    /**
     * @todo hàm send phone-pad
     * @param string callId: mã cuộc gọi
     * @param function callback
     * @return Promise
     */
    this.sendDTMF = (callId, dtmf, callback) => {

        return this._mapping.sendDTMF(callId, dtmf, callback);
    };

    /**
     * @todo Hàm gửi thông tin qua lại
     * @param string callId: mã cuộc gọi
     * @param string json info: thông tin
     * @param function callback
     * @return Promise
     */
    this.sendCallInfo = (callId, callInfo, callback) => {

        return this._mapping.sendCallInfo(callId, callInfo, callback);
    };

    /**
     * @todo Hàm gửi thông tin qua lại
     * @param string callId: mã cuộc gọi
     * @param string json info: thông tin
     * @param function callback
     * @return Promise
     */
    this.getCallStats = (callId, callback) => {

        return this._mapping.getCallStats(callId, callback);
    };

    /**
     * @todo hàm chuyển đổi camera trước hoặc sau
     * @param string callId: mã cuộc gọi
     * @param function callback
     * @return Promise
     */
    this.switchCamera = (callId, callback) => {

        return this._mapping.switchCamera(callId, callback);
    };

    /**
     * @todo Hàm bật tắt video
     * @param string callId: mã cuộc gọi
     * @param boolean enabled: trạng thái
     * @param function callback
     * @return Promise
     */
    this.enableVideo = (callId, enabled, callback) => {

        return this._mapping.enableVideo(callId, enabled, (status, code, message) => {

            callback && callback(status, code, message);
            if (status) {

                // set lại thông tin cuộc gọi
                this.setCallInfo({
                    isEnableVideo: enabled
                });
                InCallManager.setKeepScreenOn(enabled);
            }
        });
    };

    /**
     * @todo hàm tắt mic
     * @param string callId: mã cuộc gọi
     * @param function callback
     * @return Promise
     */
    this.mute = (callId, mute, callback) => {

        return this._mapping.mute(callId, mute, (status, code, message) => {

            callback && callback(status, code, message);
            if (status) {

                // set lại thông tin cuộc gọi
                this.setCallInfo({
                    isMuted: mute
                });
                InCallManager.setMicrophoneMute(mute);
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
    this.setSpeakerphoneOn = (callId, on, callback) => {

        return this._mapping.setSpeakerphoneOn(callId, on, (status, code, message) => {

            callback && callback(status, code, message);
            if (status) {

                // set lại thông tin cuộc gọi
                this.setCallInfo({
                    isEnableSpeaker: on
                });
                InCallManager.setSpeakerphoneOn(on);
            }
        });
    };

    /**
     * @todo hàm thêm mới hàm xử lý comfirm
     * @param string name: tên sự kiện
     * @param function handle: hàm
     */
    this.addCommand = (name, handle) => {

        this._commands[name] = handle;

        return {
            remove: () => {
                return this.removeCommand(name)
            }
        };
    };

    /**
     * @todo hàm xoá command
     * @param string name: tên sự kiện
     */
    this.removeCommand = (name) => {

        delete this._commands[name];
    };

    /**
     * @todo hàm send nội dung cần callback
     * @param string callId: mã cuộc gọi
     * @param json string info: nội dung
     * @param function callback(err, data)
     * @return Promise
     */
    this.sendComfirmInfo = (callId, info, callback) => {

        return new Promise((resolve, reject) => {

            let event;
            try {

                let eventID = `requestComfirm-${(new Date()).getTime()}`;
                info = generateRequestComfirm(callId, eventID, info);

                // listen sự kiện trả về
                event = this.addListener(comfirmAnswerEventName, (e) => {

                    try {

                        // nếu đúng event id thì remove event
                        if (e.eventId == eventID) {

                            event && event.remove && event.remove();
                            callback && callback(null, e.data, e);
                            resolve(e.data);
                        }
                    } catch (error) {
                        reject(error);
                    }
                });

                // gửi request comfirm
                this.sendCallInfo(callId, info, (status, code, message) => {

                    // nếu gửi không thành công
                    if (!status) {

                        event && event.remove && event.remove();
                        let error = new Error(message);
                        error.code = code;
                        callback && callback(error);
                        reject(error);
                    }
                });
            } catch (error) {

                event && event.remove && event.remove();
                callback && callback(error);
                reject(error);
            }
        });
    };

    /**
     * @todo hàm send nội dung callback từ comfirm info
     * @param string callId: mã cuộc gọi
     * @param string eventId: mã sự kiện
     * @param json string info: nội dung
     * @param function callback(err, data)
     * @return Promise
     */
    this.sendAnswerInfo = (callId, eventID, info, callback) => {

        return new Promise((resolve, reject) => {

            try {

                info = generateAnswerComfirm(callId, eventID, info);

                // gửi answer request comfirm
                this.sendCallInfo(callId, info, (status, code, message) => {

                    // nếu gửi không thành công
                    if (!status) {

                        let error = new Error(message);
                        error.code = code;
                        callback && callback(error);
                        return reject(error);
                    }

                    let res = {
                        status,
                        code,
                        message
                    };

                    callback && callback(null, res);
                    resolve(res);
                });
            } catch (error) {

                callback && callback(error);
                reject(error);
            }
        });
    };

    /**
     * @todo Hàm phát âm thanh
     * @param string songName: tên file
     * @param number numberOfLoops: số lần lặp lại
     * @param function callback(err, status)
     */
    this.playSound = (songName, numberOfLoops = -1, callback) => {

        return new Promise(async (resolve, reject) => {

            try {

                try {

                    await this.stopSound();
                } catch (error) { }

                // loadded handle
                const loaddedHandle = (error, sound) => {

                    if (error) {

                        this._soundPlaying = null;
                        callback && callback(error, false);
                        reject(error);
                        return;
                    }

                    if (!this._soundPlaying) {

                        error = new Error("Ringtone is stoped")
                        callback && callback(error, false);
                        reject(error);
                        // resolve(false);
                        return;
                    }

                    // config player
                    this._soundPlaying.setVolume(1);
                    this._soundPlaying.setNumberOfLoops(numberOfLoops);

                    // playend call back
                    const playHandle = (success) => {
                        callback && callback(null, success);
                        if (!success) {

                            return reject(new Error("Cannot play ringing"));
                        }
                        resolve(success);
                    };

                    // add vào task list để destroy
                    this._taskManager.addTask(playHandle, (cancelable) => {

                        reject(cancelable);
                    });

                    this._soundPlaying.play(playHandle);
                };

                // add vào task list để destroy
                this._taskManager.addTask(loaddedHandle, (cancelable) => {

                    reject(cancelable);
                });

                this._soundPlaying = new Sound(songName, Sound.MAIN_BUNDLE, loaddedHandle);

            } catch (error) {

                callback && callback(error);
                reject(error);
            }
        });
    };

    /**
     * @todo hàm ngưng phát âm thanh
     * @param function callback(err, success)
     * @return Promise
     */
    this.stopSound = (callback) => {

        return new Promise((resolve, reject) => {

            try {
                if (this._soundPlaying) {

                    let isPlaying = false;
                    if (this._soundPlaying.isPlaying()) {

                        isPlaying = true;
                        this._soundPlaying.stop();
                        this._soundPlaying.reset();
                    }

                    this._soundPlaying.release();
                    this._soundPlaying = null;

                    callback && callback(null, isPlaying);
                    return resolve(true);
                }

                this._soundPlaying = null;

                callback && callback(null, false);
                resolve(false);
            } catch (error) {

                callback && callback(error);
                reject(error);
            }
        });
    };

    /**
     * @todo hàm check âm thanh đang phát
     * @param function callback(err, status)
     * @return Promise
     */
    this.isSoundPlaying = (callback) => {

        return new Promise((resolve, reject) => {

            try {
                if (this._soundPlaying && this._soundPlaying.isPlaying()) {

                    callback && callback(null, true);
                    return resolve(true);
                }

                callback && callback(null, false);
                resolve(false);
            } catch (error) {

                callback && callback(error);
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
    this.addListener = (eventName, handle, ...args) => {

        let event;

        if (Object.keys(ClockEvents).includes(eventName)) {

            event = this._eventClockManager.addListener(eventName, handle, ...args);
        } else if (Object.keys(InCallManagerEvents).includes(eventName)) { // nếu là event của incall

            event = this._eventManager.addListener(eventName, handle, ...args);
        } else {

            // nếu event là gửi nhận thông tin
            if (
                eventName == comfirmRequestEventName
                || eventName == comfirmAnswerEventName
                || eventName == "onReceiveCallInfo"
            ) {
                handle = generateCallInfoHandle(eventName, handle);
                eventName = "onReceiveCallInfo";
            }

            // listen sự kiện
            event = this._mapping.addListener(eventName, handle, ...args);
        }

        return event;
    };

    /**
     * @todo hàm huỷ tất cả sự kiện
     */
    this.removeAllListeners = () => {

        if (this._timeTickID) {

            clearInterval(this._timeTickID);
            this._timeTickID = null;
        }

        // huỷ sự kiện theo dõi mạng
        if (this._networkEvent) {

            this._networkEvent.remove && this._networkEvent.remove();
            this._networkEvent = null;
        }

        // huỷ sự kiện xử lý trên nhiều thiết bị
        if (this._eventHandleOnAnotherDevice) {

            this._eventHandleOnAnotherDevice.remove && this._eventHandleOnAnotherDevice.remove();
            this._eventHandleOnAnotherDevice = null;
        }

        // huỷ sự kiện thay đổi cuộc gọi
        if (this._eventSwitchCallHandle) {

            this._eventSwitchCallHandle.remove && this._eventSwitchCallHandle.remove();
            this._eventSwitchCallHandle = null;
        }
        
        // huỷ sự kiện thêm cuộc gọi
        if (this._eventAddedCallHandle) {

            this._eventAddedCallHandle.remove && this._eventAddedCallHandle.remove();
            this._eventAddedCallHandle = null;
        }

        // huỷ sự kiện kết thúc cuộc gọi
        if (this._eventRemovedCallHandle) {

            this._eventRemovedCallHandle.remove && this._eventRemovedCallHandle.remove();
            this._eventRemovedCallHandle = null;
        }
        
        // huỷ sự kiện trạng thái cuộc gọi
        if (this._eventChangeSignalingState) {

            this._eventChangeSignalingState.remove && this._eventChangeSignalingState.remove();
            this._eventChangeSignalingState = null;
        }

        // huỷ sự kiện trạng thái kết nối
        if (this._eventChangeMediaState) {

            this._eventChangeMediaState.remove && this._eventChangeMediaState.remove();
            this._eventChangeMediaState = null;
        }

        this._eventManager.removeAllListeners();
        this._eventClockManager.removeAllListeners();
        return this._mapping.removeAllListeners();
    };

    /**
     * @todo hàm huỷ tất cả task (callback)
     */
    this.stopAllTasks = () => {

        this._taskManager.stopAllTasks();
        this._mapping.stopAllTasks();
    };

    /**
     * @todo hàm huỷ toàn bộ sự kiện, task
     */
    this.destroy = () => {

        this._isDestroy = true;

        if (this._handleCallId) {
            
            return;
        }

        if (this._timeTickID) {
            clearInterval(this._timeTickID);
            this._timeTickID = null;
        }
        this.setCallInfo(null);

        this.stopAllTasks();
        this.removeAllListeners();
        this._taskManager.destroy();
        this._eventManager.destroy();
        this._eventClockManager.destroy();
        this._mapping.destroy();
        this._commands = {};
    };

    // khởi tạo
    init.apply(this, []);
};