import { Platform } from 'react-native';
import TaskManager from '../../Support/TaskManager';
import RNStringeeCall from './StringeeCall';
import checkPermissions from '../checkPermissions';
import CallManager from '../CallManager';
import DEFAULT_OPTIONS from './defaultOptions';
import EVENTS from './events';
import mixins from './mixins';
import mixinAnswered from './mixins/answered';
import mixinEnded from './mixins/ended';
import mixinIncomingCall from './mixins/incomingCall';
import createTaskEndCallWhenReconnect from './mixins/createTaskEndCallWhenReconnect';

class StringeeCall {

    constructor(options = {}) {

        this.options = {
            ...DEFAULT_OPTIONS,
            ...options
        };

        // quản lý task
        this._taskManager = new TaskManager();
        this._mapping = new RNStringeeCall();

        // sự kiện trạng thái cuộc gọi
        this._eventChangeSignalingState = null;

        // sự kiện trạng thái kết nối
        this._eventChangeMediaState = null;

        // sự kiện thêm mới 1 cuộc gọi
        this._eventAddedCallHandle = null;

        // sự kiện chuyển đổi đàm thoại cuộc gọi
        this._eventSwitchCallHandle = null;

        // sự kiện xoá cuộc gọi
        this._eventRemovedCallHandle = null;

        // sự kiện thao tác trên nhiều thiết bị
        this._eventHandleOnAnotherDevice = null;

        // thông tin cuộc gọi
        this._callInfo = null;

        // mã cuộc gọi đang xử lý
        this._handleCallId = null;

        // bộ đếm thời gian
        this._timeTickID = null;

        // bổ sung hàm
        mixins.apply(this);
    }

    /**
     * @todo hàm khởi tạo cuộc gọi
     * @param parameters
     * @param function callback
     * @return Promise
     */
    makeCall = (parameters, callback) => {

        try {
            if (typeof parameters !== "string") {

                parameters = JSON.stringify(parameters);
            }
        } catch (error) {
            parameters = "";
        }

        let options = JSON.parse(parameters);

        // set thông tin cuộc gọi hiện tại
        this.setCallInfo({
            ...options,
            isEnableVideo: options.isVideoCall,
            isMuted: false,
            isEnableSpeaker: options.isVideoCall,
            callState: 0,
            mediaState: 1,
            answered: false,
            isOutgoingCall: true,
            connectTime: 0,
            bandwidth: 0,
            isConnected: true
        });

        // số lượng cuộc gọi
        let totalCall = CallManager.getAllCallHandles().length;
        // cuộc gọi đang xử lý
        let currentCallId = CallManager.getCurrentHandle();

        // thêm 1 cuộc gọi
        CallManager.addInitCallHandle(this.getCallInfo());

        // nếu không có xử lý cuộc gọi nào thì set cuộc gọi hiện tại thành đang xử lý
        if (
            !totalCall
            || !currentCallId
        ) {

            CallManager.setCurrentHandle(CallManager.getInitCallID());
        }

        return this._mapping.makeCall(parameters, (status, code, message, callId) => {

            CallManager.removeCallHandle(CallManager.getInitCallID());
            callback && callback(status, code, message, callId);

            // nếu tạo cuộc gọi thành công
            if (status) {

                // set thông tin cuộc gọi hiện tại
                this.setCallInfo({
                    ...options,
                    callId,
                    isEnableVideo: options.isVideoCall,
                    isMuted: false,
                    isEnableSpeaker: options.isVideoCall,
                    callState: 0,
                    mediaState: 1,
                    answered: false,
                    isOutgoingCall: true,
                    connectTime: 0,
                    bandwidth: 0,
                    isConnected: true
                });

                // phân quyền
                if (this.options.autoCheckPermissions) {

                    this._taskManager.addTask(checkPermissions(true, options.isVideoCall, this.options.permistionRationale, this.options.permissionDeniedCallback));
                }


                // khởi tạo event gọi
                this._incomingCall(callId, true);

            } else {

                // set thông tin cuộc gọi hiện tại
                this.setCallInfo(null);
            }
        });
    };

    /**
     * @todo hàm khởi tạo nhận cuộc gọi đến
     * @param string callId: mã cuộc gọi
     * @return Promise
     */
    initAnswer = (callId, callback) => {

        // set thông tin cuộc gọi hiện tại
        this.setCallInfo({
            callId,
            isEnableVideo: false,
            isMuted: false,
            isEnableSpeaker: false,
            callState: 0,
            mediaState: 1,
            answered: false,
            isOutgoingCall: false,
            connectTime: 0,
            bandwidth: 0,
            isConnected: true
        });

        // số lượng cuộc gọi
        let totalCall = CallManager.getAllCallHandles().length;
        // cuộc gọi đang xử lý
        let currentCallId = CallManager.getCurrentHandle();

        // thêm 1 cuộc gọi
        CallManager.addCallHandle(callId, this.getCallInfo());

        // nếu không có xử lý cuộc gọi nào thì set cuộc gọi hiện tại thành đang xử lý
        if (
            !totalCall
            || !currentCallId
        ) {

            CallManager.setCurrentHandle(callId);
        }

        return this._mapping.initAnswer(callId, (status, code, message) => {

            callback && callback(status, code, message);

            if (status) {

                // set thông tin cuộc gọi hiện tại
                this.setCallInfo({
                    callId,
                    isEnableVideo: false,
                    isMuted: false,
                    isEnableSpeaker: false,
                    callState: 0,
                    mediaState: 1,
                    answered: false,
                    isOutgoingCall: false,
                    connectTime: 0,
                    bandwidth: 0,
                    isConnected: true
                });

                // khởi tạo event cuộc gọi
                this._incomingCall(callId, false);

                // lấy thông tin cuộc gọi từ người gọi
                this.sendComfirmInfo(callId, JSON.stringify({
                    type: "__getCallInfo__"
                }), (err, data) => {

                    if (err) {
                        return;
                    }

                    try {
                        if (typeof data == "string") {

                            data = JSON.parse(data);
                        }
                    } catch (error) { }

                    data = data || {};

                    let callInfo = this.getCallInfo() || {
                        callId,
                        isEnableVideo: false,
                        isMuted: false,
                        isEnableSpeaker: false,
                        callState: 1,
                        mediaState: 1,
                        answered: false,
                        isOutgoingCall: false,
                        connectTime: 0,
                        bandwidth: 0,
                        isConnected: true
                    };

                    if (data) {

                        this.setCallInfo({
                            ...data,
                            ...callInfo,
                            callId,
                            from: data.to,
                            fromAlias: data.toAlias,
                            to: data.from,
                            toAlias: data.fromAlias,
                            isOutgoingCall: false
                        });
                    }
                });
            } else {
                
                CallManager.removeCallHandle(callId);
                this.setCallInfo(null);
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

        return this._mapping.answer(callId, async (status, code, message) => {

            if (status) {

                let callInfo = this.getCallInfo() || {};
                callInfo = {
                    ...callInfo,
                    callState: 2,
                    answered: true
                };
                this.setCallInfo(callInfo);

                if (!CallManager.isGSMCall(CallManager.getCurrentHandle())) {

                    CallManager.setCurrentHandle(callId);
                }
            }
            callback && callback(status, code, message);
        });
    };

    /**
     * @todo hàm kết thúc cuộc gọi
     * @param string callId: mã cuộc gọi
     * @param function callback
     * @return Promise
     */
    hangup = (callId, callback, fromEvent = false) => {

        // nếu không có kết nối và cho phép kết thúc cuộc gọi khi không có kết nối
        if (!this._isConnected && this.options.endCallWhenDisconnect) {

            let taskEndCall = null;
            this._outcomingCall(callId);

            // nếu cho phép tự động kết thúc khi có kết nối trở lại
            if (this.options.autoEndCallWhenReconnect) {

                taskEndCall = createTaskEndCallWhenReconnect.apply(this, [
                    "hangup",
                    callId
                ]);
            }

            // kết thúc cuộc gọi
            return this._mapping.hangup(callId, (status, code, message) => {

                if (status) {

                    taskEndCall
                        && taskEndCall.cancel
                        && taskEndCall.cancel()
                    ;

                    let callInfo = this.getCallInfo() || {};
                    callInfo = {
                        ...callInfo,
                        callState: 4
                    };
                    this.setCallInfo(callInfo);
                }

                callback && callback(status, code, message);
            });
        }

        // kết thúc cuộc gọi
        return this._mapping.hangup(callId, (status, code, message) => {

            if (status) {

                let callInfo = this.getCallInfo() || {};
                callInfo = {
                    ...callInfo,
                    callState: 4
                };
                this.setCallInfo(callInfo);

                this._outcomingCall(callId, fromEvent);
            }

            callback && callback(status, code, message);
        });
    };

    /**
     * @todo Hàm huỷ cuộc gọi đến (không bắt máy)
     * @param string callId: mã cuộc gọi
     * @param function callback
     * @return Promise
     */
    reject = (callId, callback) => {

        // nếu không có kết nối và cho phép kết thúc cuộc gọi khi không có kết nối
        if (!this._isConnected && this.options.endCallWhenDisconnect) {

            let taskEndCall = null;
            this._outcomingCall(callId);
            
            // nếu cho phép tự động ngắt khi có mạng trở lại
            if (this.options.autoEndCallWhenReconnect) {

                taskEndCall = createTaskEndCallWhenReconnect.apply(this, [
                    "reject",
                    callId
                ]);
            }

            // gọi kết thúc cuộc gọi
            return this._mapping.reject(callId, (status, code, message) => {

                if (status) {

                    taskEndCall
                        && taskEndCall.cancel
                        && taskEndCall.cancel()
                    ;

                    let callInfo = this.getCallInfo() || {};
                    callInfo = {
                        ...callInfo,
                        callState: 3
                    };
                    this.setCallInfo(callInfo);
                }

                callback && callback(status, code, message);
            });
        }

        // kết thúc cuộc gọi
        return this._mapping.reject(callId, (status, code, message) => {

            if (status) {

                let callInfo = this.getCallInfo() || {};
                callInfo = {
                    ...callInfo,
                    callState: 3
                };
                this.setCallInfo(callInfo);
                this._outcomingCall(callId);
            }

            callback && callback(status, code, message);
        });
    };

    /**
     * @todo Hàm lưu thông tin cuộc gọi
     * @param object info
     */
    setCallInfo = (info = null) => {

        if (info) {

            this._callInfo = this._callInfo || {};
            this._callInfo = {
                ...this._callInfo,
                ...info
            };

            // nếu đang xử lý cuộc gọi này thì cập nhật lại thông tin
            let callId = this._callInfo["callId"];
            if (callId && CallManager.hasCallHandle(callId)) {

                CallManager.updateCallInfo(callId, this._callInfo);
            }
            return this;
        }
        this._callInfo = null;
        return this;
    };

    /**
     * @todo Hàm lấy thông tin cuộc gọi
     */
    getCallInfo = () => {

        return this._callInfo;
    };

    /**
     * @todo hàm hỗ trợ đăng ký sự kiện xử lý khi đang gọi
     */
    _incomingCall = (callId, isOutgoingCall = true) => {

        this._handleCallId = callId;

        // cuộc gọi GSM
        let hasGSM = CallManager.hasGSMCallHandle();
        // số lượng cuộc gọi
        let totalCall = CallManager.getAllCallHandles().length;
        // cuộc gọi đang xử lý
        let currentCallId = CallManager.getCurrentHandle();
        // thông tin cuộc gọi đang xử lý
        let currentCallInfo = CallManager.getCallInfo(currentCallInfo);
        let emptyHandle = () => {};

        // nếu đang có GSM
        // hoặc đang có cuộc gọi khác mà chưa trong trạng thái đàm thoại
        // kết thúc cuộc gọi
        if (
            hasGSM
            || (
                currentCallId
                && !CallManager.isGSMCall(currentCallId)
                && !CallManager.isInitCall(currentCallId)
                && currentCallInfo
                && !currentCallInfo.answered
            )
        ) {

            if (isOutgoingCall) {

                return this.hangup(callId, emptyHandle);
            }

            return this.reject(callId, emptyHandle);
        }

        let incomingCall = mixinIncomingCall.bind(this);
        let answered = mixinAnswered.bind(this);
        let ended = mixinEnded.bind(this);

        // thêm 1 cuộc gọi
        CallManager.addCallHandle(callId, this.getCallInfo());

        // nếu không có xử lý cuộc gọi nào thì set cuộc gọi hiện tại thành đang xử lý
        if (
            !totalCall
            || !currentCallId
        ) {

            CallManager.setCurrentHandle(callId);
        }

        // đổ chuông
        incomingCall(callId, callId);

        // hàm xử lý trạng thái cuộc gọi từ event
        const handleCallState = (e) => {

            // thông tin cuộc gọi hiện tại
            let callInfo = this.getCallInfo() || {};

            // nếu là trạng thái kết thúc cuộc gọi
            if( e.code == 3 || e.code == 4 ) {

                // remove cuộc gọi
                CallManager.removeCallHandle(e.callId);
                ended(e.callId, true);
            }

            switch (callInfo.callState) {
                case undefined:
                case "":
                case 0:

                    if (!isOutgoingCall) {

                        // đổ chuông
                        incomingCall(e.callId, callId);
                    }
                    break;

                case 1:

                    // đổ chuông
                    incomingCall(e.callId, callId);
                    break;

                case 2:

                    if (e.callId == callId) {

                        if (!this._timeTickID && callInfo.mediaState === 0) {

                            this._startTimeTick(callId);
                        }
                    } else {

                        if (!CallManager.isGSMCall(CallManager.getCurrentHandle())) {

                            CallManager.setCurrentHandle(e.callId);
                        }
                    }

                    answered(e.callId, callId);
                    break;

                case 3:
                case 4:

                    if (e.callId == callId) {

                        if (Platform.OS == "android") {

                            this.hangup(callId, emptyHandle, true);
                        } else {

                            this._outcomingCall(callId, true);
                        }
                    }
                    break;
            }
        };

        // event xử lý trên nhiều thiết bị
        this._eventHandleOnAnotherDevice && this._eventHandleOnAnotherDevice.remove && this._eventHandleOnAnotherDevice.remove();
        this._eventHandleOnAnotherDevice = this.addListener("onHandleOnAnotherDevice", (e) => {

            if (callId != e.callId) {

                return;
            }


            if (e.code >= 2) {
                
                this._outcomingCall(callId, true);
            }
        });

        // sự kiện thêm 1 cuộc gọi
        this._eventAddedCallHandle && this._eventAddedCallHandle.remove && this._eventAddedCallHandle.remove();
        this._eventAddedCallHandle = CallManager.addListener("onAddedCallHandle", (e) => {

            if (!e.callId) {

                return;
            }

            // đổ chuông
            incomingCall(e.callId, callId);
        });

        // sự kiện chuyển cuộc gọi
        this._eventSwitchCallHandle && this._eventSwitchCallHandle.remove && this._eventSwitchCallHandle.remove();
        this._eventSwitchCallHandle = CallManager.addListener("onSwitchCallHandle", (e) => {

            if(!e.callId) {
                return;
            }

            handleCallState(e);
        });

        // sự kiện thay đổi cuộc gọi xử lý
        this._eventRemovedCallHandle && this._eventRemovedCallHandle.remove && this._eventRemovedCallHandle.remove();
        this._eventRemovedCallHandle = CallManager.addListener("onRemovedCallHandle", (e) => {

            if (CallManager.isGSMCall(e.callId)) {

                ended(e.callId);
            }
        });

        // trạng thái kết nối
        this._eventChangeMediaState && this._eventChangeMediaState.remove && this._eventChangeMediaState.remove();
        this._eventChangeMediaState = this.addListener("onChangeMediaState", (e) => {

            if (callId != e.callId) {

                return;
            }

            this.setCallInfo({
                mediaState: e.code
            });

            if (e.code === 0 && !this._timeTickID) {

                this._startTimeTick(callId);
            }
        });

        // sự kiện trạng thái cuộc gọi
        this._eventChangeSignalingState && this._eventChangeSignalingState.remove && this._eventChangeSignalingState.remove();
        this._eventChangeSignalingState = this.addListener("onChangeSignalingState", (e) => {

            // thông tin cuộc gọi hiện tại
            let callInfo = this.getCallInfo() || {};

            if (callId == e.callId) {

                // gán thông tin cuộc gọi
                callInfo = {
                    ...callInfo,
                    callState: e.code,
                    answered: e.code == 2 ? true : callInfo.answered
                };
                this.setCallInfo(callInfo);
            }

            handleCallState(e);
        });
    };

    /**
     * @todo Hàm bắt đầu tính thời gian
     */
    _startTimeTick = (callId) => {

        let isSync = false;

        let getCurrentConnectTime = () => {

            let callInfo = CallManager.getCallInfo(callId) || {};
            return (callInfo.connectTime * 1) || 0;
        };

        // hàm đồng bộ thời gian
        let syncTime = (callback) => {

            let now = (new Date()).getTime();

            // lấy thông tin cuộc gọi từ người gọi
            this.sendComfirmInfo(callId, JSON.stringify({
                type: "__getCallInfo__"
            }), (err, data) => {

                let lossTime = (new Date()).getTime() - now;
                let currentTime = getCurrentConnectTime();
                let connectTime = currentTime + lossTime;

                if (err) {

                    return callback && callback(connectTime);
                }

                try {
                    if (typeof data == "string") {

                        data = JSON.parse(data);
                    }
                } catch (error) { }

                data = data || {};

                connectTime = (data.connectTime * 1) || 0;
                connectTime = connectTime + lossTime;
                if (connectTime < currentTime + lossTime) {

                    connectTime = currentTime + lossTime;
                }

                connectTime = connectTime;

                callback && callback(connectTime);
            });
        };

        // hàm bắt đầu tính thời gian
        let start = () => {

            // thời gian tính theo giây
            let timestamp = 0;
            // thời gian lần tick trước
            let mPrevCallTimestamp = timestamp;
            // kích thước lần down trước
            let mPrevCallBytes = 0;
            // bandwith lần down trước
            let mCallBw = 0;

            // khởi tạo bộ đếm
            this._timeTickID = setInterval(() => {

                // lấy thời gian trước đó
                let connectTime = getCurrentConnectTime();

                // bỏ 5s đầu
                if (connectTime >= 5000) {
                    
                    // đồng bộ lại thời gian sau mỗi 10s
                    if (Math.floor(connectTime / 1000) % 10 == 0) {
                        
                        isSync = false;
                    }

                    // nếu thời gian chưa được đồng bộ
                    if (!isSync) {
                        
                        syncTime((time) => {
                            
                            this.setCallInfo({
                                connectTime: time
                            });
                            isSync = true;
                        });
                    }
                }

                // lấy thông tin download
                this._mapping.getCallStats(callId, (status, code, message, stats) => {

                    // parse dữ liệu
                    if (typeof stats === "string") {

                        try {
                            stats = JSON.parse(stats);
                        } catch (error) {
                            stats = {};
                        }
                    }
                    const {
                        bytesReceived = 0,
                        timeStamp: timestamp_ms = 0
                    } = stats || {};

                    // convert sang giây
                    timestamp = timestamp_ms / 1000;

                    // nếu chưa khởi tạo
                    if (mPrevCallTimestamp == 0) {

                        mPrevCallTimestamp = timestamp;
                        mPrevCallBytes = bytesReceived;
                    } else {

                        // tính bandwith
                        let CallBw = ((8 * (bytesReceived - mPrevCallBytes)) / (timestamp - mPrevCallTimestamp));

                        // set lại thông tin
                        this.setCallInfo({
                            bandwidth: CallBw
                        });

                        // nếu khác với giá trị trước thì trigger
                        if (CallBw != mCallBw) {

                            this._clockEmiter.emit("onChangeBandwidth", {
                                callId,
                                bandwidth: CallBw
                            });
                        }

                        // set lại dữ liệu
                        mCallBw = CallBw;
                        mPrevCallTimestamp = timestamp;
                        mPrevCallBytes = bytesReceived;
                    }
                });

                // tick thời gian
                connectTime = connectTime + 1000;

                this.setCallInfo({
                    connectTime
                });

                // trigger time tick
                this._clockEmiter.emit("onTimeTick", {
                    callId,
                    connectTime
                });
            }, 1000);
        };
        
        let callInfo = CallManager.getCallInfo(callId) || {};
        if (!callInfo.isOutgoingCall) {

            return start();
        }

        syncTime((connectTime) => {
            
            this.setCallInfo({
                connectTime
            });
            isSync = true;
            start();
        });
    };

    /**
     * @todo hàm hỗ trợ huỷ event khi tắt máy
     */
    _outcomingCall = (callId, fromEvent = false) => {

        this._handleCallId = null;
        const ended = mixinEnded.bind(this);

        try {

            if (this._timeTickID) {

                clearInterval(this._timeTickID);
                this._timeTickID = null;
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

            CallManager.removeCallHandle(callId);

            ended(callId, fromEvent);

            // huỷ thông tin cuộc gọi
            this.setCallInfo(null);
        } catch (error) { }

        // nếu đã huỷ class, thì gọi huỷ class
        if (this._isDestroy) {

            this.destroy();
        }
    };
}

StringeeCall.EVENTS = EVENTS;

export default StringeeCall;