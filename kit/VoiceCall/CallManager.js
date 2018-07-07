import EventEmitter from 'EventEmitter';
import EventManager from '../Support/EventManager';
import CallDetector from 'react-native-call-detection';
import { PermissionsAndroid, Platform } from 'react-native';

class CallManager {

    constructor(options = {}) {

        // cấu hình
        this.options = {
            ...options,
            permistionRationale: options.permistionRationale || {}
        };
        this._eventEmiter = new EventEmitter();
        this._eventManager = new EventManager(this._eventEmiter);

        // tất cả các cuộc gọi lưu theo callId
        this._callHandles = [];

        // cuộc gọi đang được đàm thoại
        this._currentCallHandle = null;

        // check init
        this._isConfigured = false;

        // sự kiện GSM
        this._eventGSMChangeState = null;
    }

    configure = (options = {}) => {

        return new Promise(async (resolve, reject) => {

            this.options = {
                ...this.options,
                ...options,
                permistionRationale: options.permistionRationale || {}
            };

            if (this._isConfigured) {

                return resolve(true);
            }

            if( Platform.OS == "android" ) {

                try {
                    
                    const granted = await PermissionsAndroid.request(
                        PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE, 
                        this.options.permistionRationale
                    );

                    if (
                        !(granted === true || granted === PermissionsAndroid.RESULTS.GRANTED)
                    ) {
    
                        this.options.permissionDeniedCallback && this.options.permissionDeniedCallback(PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE, granted);
                        throw new Error("Permistion denied");
                    }
                } catch (error) {
                    
                    return reject(error);
                }
            }

            const handleCallState = ({ incomingNumber, state }) => {

                // nếu kết thúc cuộc gọi GSM thì remove cuộc gọi ra khỏi hàng đợi
                if (EndedStates.includes(state)) {

                    this.removeCallHandle(GSM_CALL_ID);
                } else {

                    if (this.hasCallHandle(GSM_CALL_ID)) {

                        this.updateCallInfo(GSM_CALL_ID, {
                            state,
                            incomingNumber,
                            answered: false
                        });
                    } else {

                        this.addCallHandle(GSM_CALL_ID, {
                            state,
                            incomingNumber,
                            answered: false
                        });
                    }

                    if (
                        !this._currentCallHandle
                        || AnsweredStates.includes(state)
                    ) {
                        this.updateCallInfo(GSM_CALL_ID, {
                            state,
                            answered: true,
                            incomingNumber
                        });
                        this.setCurrentHandle(GSM_CALL_ID);
                    }
                }

                // trigger GSM change state
                this._eventEmiter.emit("onGSMChangeState", {
                    state,
                    incomingNumber
                });

                let eventName = GSM_STATES[state];
                if (eventName) {

                    this._eventEmiter.emit(eventName, {
                        state,
                        incomingNumber
                    });
                }
            };

            this._eventGSMChangeState
                && this._eventGSMChangeState.remove
                && this._eventGSMChangeState.remove()
            ;
            
            
            try {
                await CallDetector.startListener();
                CallDetector.getCallState().then(handleCallState);
                this._eventGSMChangeState = CallDetector.addListener("PhoneState", handleCallState);
            } catch (error) {

                reject(error);
            }

            this._isConfigured = true;
            resolve(true);
        });
    };

    /**
     * @todo hàm thêm 1 cuộc gọi đang xử lý
     * @param string callId: mã cuộc gọi
     * @param object callInfo: thông tin cuộc gọi
     */
    addCallHandle = ( callId, callInfo = {} ) => {

        if (this.isGSMCall(callId)) {

            this._checkIsConfigured();
        }

        if (!this.hasCallHandle(callId)) {
            
            callInfo = callInfo || {};

            this._callHandles.push({
                callId,
                callInfo
            });

            this._eventEmiter.emit("onAddedCallHandle", {
                callId,
                callInfo
            });
            return true;
        } else {

            this.updateCallInfo(callId, callInfo);
        }
        return false;
    };

    /**
     * @todo hàm thêm 1 cuộc gọi đi đang chờ kết quả tạo từ server
     * @param object callInfo: thông tin cuộc gọi
     */
    addInitCallHandle = (callInfo = {}) => {

        return this.addCallHandle(INIT_CALL_ID, callInfo);
    };

    /**
     * @todo Hàm cập nhật lại thông tin cuộc gọi
     * @param string callId: mã cuộc gọi
     * @param object callInfo: thông tin cuộc gọi
     */
    updateCallInfo = (callId, callInfo = {}) => {

        if (this.isGSMCall(callId)) {

            this._checkIsConfigured();
        }

        let index = findIndexCallHandle(this._callHandles, callId);
        if (index !== -1) {

            callInfo = callInfo || {};

            this._callHandles[index] = {
                callId,
                callInfo
            };
            
            this._eventEmiter.emit("onUpdatedCallHandle", {
                callId,
                callInfo
            });
            return true;
        }
        return false;
    };

    /**
     * @todo hàm kiểm tra có đang xử lý cuộc gọi
     * @param string callId
     * @return boolean
     */
    hasCallHandle = (callId) => {

        if (this.isGSMCall(callId)) {

            this._checkIsConfigured();
        }
        return findIndexCallHandle(this._callHandles, callId) !== -1;
    };

    /**
     * @todo hàm kiểm tra có đang xử lý cuộc gọi gsm
     * @return boolean
     */
    hasGSMCallHandle = () => {

        return this.hasCallHandle(GSM_CALL_ID);
    };

    /**
     * @todo hàm kiểm tra có đang xử lý cuộc gọi gsm
     * @return boolean
     */
    hasInitCallHandle = () => {

        return this.hasCallHandle(INIT_CALL_ID);
    };

    /**
     * @todo Hàm set cuộc gọi đang hội thoại
     * @param string callId
     */
    setCurrentHandle = (callId) => {

        if (
            !callId
            || (
                this._currentCallHandle !== callId 
                && this.hasCallHandle(callId)
            )
        ) {

            this._currentCallHandle = callId;
            this._eventEmiter.emit("onSwitchCallHandle", {
                callId
            });
        }
    };

    /**
     * @todo hàm lấy mã cuộc gọi đang xử lý
     * @return string callId
     */
    getCurrentHandle = () => {

        return this._currentCallHandle;
    };

    /**
     * @todo hàm lấy tất cả các cuộc gọi
     */
    getAllCallHandles = () => {

        return this._callHandles;
    };

    /**
     * @todo Hàm lấy thông tin cuộc gọi
     * @param string 
     * @return object
     */
    getCallInfo = (callId) => {

        let callInfo = this._callHandles[
            findIndexCallHandle(this._callHandles, callId)
        ];
        return callInfo ? callInfo.callInfo : undefined;
    };

    /**
     * @todo tìm thông tin cuộc gọi theo tiêu chí
     * @param string propName
     * @param any value
     */
    findCallInfo = (propName, val) => {

        let index = this._callHandles.findIndex(({ callInfo = {} }) => {

            return callInfo[propName] === val;
        });
        if(index !== -1) {

            return this._callHandles[index] && this._callHandles[index].callInfo;
        }
    };

    /**
     * @todo Hàm lấy mã cuộc gọi được add vào sau cùng
     */
    getNextCallId = () => {

        if( this._callHandles.length ) {

            let callInfo = this._callHandles[this._callHandles.length - 1];
            return callInfo ? callInfo.callId : null;
        }
        return null;
    };

    /**
     * @todo Hàm xoá 1 cuộc gọi đã kết thúc
     * @param string callId: mã cuộc gọi
     */
    removeCallHandle = (callId) => {

        let index = findIndexCallHandle(this._callHandles, callId);
        if (index !== -1) {

            this._callHandles.splice(index, 1);

            if (this._currentCallHandle == callId) {

                this.setCurrentHandle(this.getNextCallId());
            }
            this._eventEmiter.emit("onRemovedCallHandle", {
                callId
            });
            return true;
        }
        return false;
    };

    /**
     * @todo hàm thêm 1 sự kiện
     * @param string eventName: tên sự kiện
     * @param function handle: hàm xử lý
     */
    addListener = (eventName, handle, context) => {

        if (GSMEvents.includes(eventName)) {

            this._checkIsConfigured();
        }
        return this._eventManager.addListener(eventName, handle, context);
    };

    /**
     * @todo hàm xoá tất cả sự kiện
     */
    removeAllListeners = () => {

        this._eventGSMChangeState 
            && this._eventGSMChangeState.remove 
            && this._eventGSMChangeState.remove()
        ;
        this._isConfigured = false;
        return this._eventManager.removeAllListeners();
    };

    /**
     * @todo hàm kiểm tra cuộc gọi có phải là gsm
     * @param string callid | object callInfo
     * @return boolean
     */
    isGSMCall = (checker) => {

        if (checker === null) {

            return false;
        }
        if (typeof checker === "object") {

            return checker.callId == GSM_CALL_ID;
        }

        return checker == GSM_CALL_ID;
    };

    /**
     * @todo hàm kiểm tra cuộc gọi có phải là init call
     * @param string callid | object callInfo
     * @return boolean
     */
    isInitCall = (checker) => {

        if (checker === null) {

            return false;
        }
        if (typeof checker === "object") {

            return checker.callId == INIT_CALL_ID;
        }

        return checker == INIT_CALL_ID;
    };

    /**
     * @todo hàm huỷ class
     */
    destroy = () => {

        this._isConfigured = false;
        this.removeAllListeners();
        this._eventManager.destroy();
        CallDetector.stopListener();
    };

    _checkIsConfigured = () => {

        if(!this._isConfigured) {

            throw new Error("GSM detect is not configs");
        }
    };

    getGSMCallID = () => {

        return GSM_CALL_ID;
    };

    getInitCallID = () => {

        return INIT_CALL_ID;
    };
}

/**
 * @todo Hàm tìm index call handle trong mảng theo callId
 * @param {array} callHandles 
 * @param {string} callId 
 */
const findIndexCallHandle = (callHandles = [], callId) => {

    return callHandles.findIndex((callInfo = {}) => {

        return callInfo.callId == callId;
    });
};

const GSMEvents = [
    "onGSMIDLE", // android
    "onGSMDialing", // ios
    "onGSMIncoming",
    "onGSMConnected",
    "onGSMDisconnected",
    "onGSMMissed" // android
];

// mapping trạng thái với tên sự kiện
const GSM_STATES = {
    "IDLE": "onGSMIDLE",
    "Dialing": "onGSMDialing",
    "Incoming": "onGSMIncoming",
    "Missed": "onGSMMissed",
    "Connected": "onGSMConnected",
    "Disconnected": "onGSMDisconnected"
};

// trạng thái GSM end call
const EndedStates = [
    "Disconnected",
    "Missed",
    "IDLE"
];

const AnsweredStates = [
    "Connected",
    "Offhook"
];

export const EVENTS = [
    ...GSMEvents,
    "onSwitchCallHandle", // sự kiện thay đổi cuộc gọi đang xử lý
    "onAddedCallHandle", // sự kiện thêm mới 1 cuộc gọi
    "onRemovedCallHandle", // sự kiện xoá 1 cuộc gọi
    "onUpdatedCallHandle", // sự kiện cập nhật cuộc gọi
    "onGSMChangeState", // sự kiện trạng thái cuộc gọi GSM
];

export const GSM_CALL_ID = "GSM"; // mã cuộc gọi gsm
export const INIT_CALL_ID = "makeCall"; // mã cuộc gọi tạm đang chờ kết quả tạo từ server

export default new CallManager({
    permistionRationale: {},
    permissionDeniedCallback: () => {}
});