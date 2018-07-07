"use strict";
import React from 'react';
import PropTypes from 'prop-types';
import { View, NetInfo } from 'react-native';
import Text from '~/components/Text';
import NavigationBar from './NavigationBar';
import Profile from './Profile';
import IncomingCallBar from './IncomingCallBar';
import AnsweredCallBar from './AnsweredCallBar';
import PopupCaller from './PopupCaller';
import ScrollView from '~/components/ScrollView';
import Message from './Message';
import { RNCamera } from 'react-native-camera';
import shallowEqual from 'fbjs/lib/shallowEqual';
import { colors, scale, fontSizes } from '~/configs/styles';
import CallManager from '~/kit/VoiceCall/CallManager';

class CallScene extends React.Component {

    static displayName = "@CallScene";

    static propTypes = {
        // mã cuộc gọi
        callId: PropTypes.string,
        // là cuộc gọi đi
        isOutgoingCall: PropTypes.bool,
        // số gọi đến
        from: PropTypes.string,
        // tên người gọi đến
        fromAlias: PropTypes.string,
        // số gọi đi
        to: PropTypes.string,
        // tên người gọi đi
        toAlias: PropTypes.string,
        // là cuộc gọi video
        isVideoCall: PropTypes.bool,

        // loại camera
        cameraType: PropTypes.oneOf([
            RNCamera.Constants.Type.front,
            RNCamera.Constants.Type.back
        ]),
        // on/off flash
        flashMode: PropTypes.oneOf([
            RNCamera.Constants.FlashMode.on,
            RNCamera.Constants.FlashMode.off
        ]),
        // đã mở video
        isEnableVideo: PropTypes.bool,
        // đã tắt tiếng
        isMuted: PropTypes.bool,
        // đã mở loa
        isEnableSpeaker: PropTypes.bool,

        // trạng thái cuộc gọi
        callState: PropTypes.oneOf([
            0, // Used to specify the call invite is sent to Stringee Server. 
            1, // Used to specify the callee is ringing. 
            2, // Used to specify the callee answers the call. 
            3, // Used to specify the callee rejects the call. 
            4 // Used to specify the call is terminated. 
        ]),
        // trạng thái kết nối cuộc gọi
        mediaState: PropTypes.oneOf([
            0, // Used to specify the call media is connected.
            1 // Used to specify the call media is disconnected.
        ]),

        // sự kiện kết thúc
        onEnded: PropTypes.func,
        // sự kiện bắt máy
        onAccept: PropTypes.func,
        // sự kiện tắt máy
        onHangup: PropTypes.func,
        // sự kiện kết thúc cuộc gọi
        onDecline: PropTypes.func,

        // là dạng popup
        isPopup: PropTypes.bool,

        // số băng thông tối đa
        maxBandwidth: PropTypes.number
    };

    static defaultProps = {
        callId: "",
        cameraType: RNCamera.Constants.Type.front,
        flashMode: RNCamera.Constants.FlashMode.on,
        isVideoCall: false,
        isMuted: false,
        isEnableSpeaker: false,
        callState: 0,
        mediaState: 1,
        isOutgoingCall: false,

        isPopup: false,
        maxBandwidth: 30000 // 35000
    };

    constructor( props ) {
        super( props );

        this.state = {
            // mã cuộc gọi
            callId: props.callId,
            // trạng thái video local
            isEnableVideo: props.isVideoCall || props.isEnableVideo,
            // trạng thái loa
            isEnableSpeaker: props.isVideoCall || props.isEnableSpeaker,
            // trạng thái tắt tiếng
            isMuted: props.isMuted, 

            // trạng thái cuộc gọi
            callState: props.callState || 0, 
            // message trạng thái cuộc gọi
            callMessage: props.isOutgoingCall ? "Đang kết nối" : "Đang gọi", 
            // trạng thái kết nối
            mediaState: props.mediaState, 

            isLocalStreamConnected: false,
            isRemoteStreamConnected: false,

            loading: false,

            // camera trước hoặc sau
            cameraType: props.cameraType, 
            // bật flash
            flashMode: props.flashMode, 

            // avatar
            profileAvatar: null, 
            // tên người gọi
            profileName: props.isOutgoingCall ?
                (props.toAlias || props.to) :
                (props.fromAlias || props.From),

            // kết nối mạng
            isConnected: true, 
            // thông báo kết nối
            connectMessage: "",
            // loại thông báo
            connectMessageType: null, 

            // thời gian đàm thoại
            connectTime: 0, 
            isPopupDisplay: false,

            // băng thông hiện tại
            bandwidth: props.maxBandwidth
        };

        this._stringeeCall = app("stringeeCall");
    }

    static getDerivedStateFromProps( nextProps, prevState ) {

        return null;
    };

    shouldComponentUpdate(nextProps, nextState) {

        return (
            !shallowEqual(this.state, nextState)
            || !shallowEqual(this.props, nextProps)
        );
    }

    getSnapshotBeforeUpdate( nextProps, prevState ) {

        return null;
    };

    render() {

        const {
            isEnableVideo,
            bandwidth,
            profileName,
            callMessage,
            connectTime,
            callState,
            isMuted,
            isEnableSpeaker,
            isPopupDisplay,
            connectMessageType,
            connectMessage,
            isConnected
        } = this.state;

        const {
            maxBandwidth,
            isPopup
        } = this.props;

        // thời gian đàm thoại
        const timmer = convertTime(connectTime);
        // đang rung chuông
        const isRinging = callState == 0 || callState == 1;
        // đã kết thúc
        // const isEnded = callState == 3 || callState == 4;
        // đang đàm thoại
        const isAnswered = callState == 2;

        if (isPopup && isRinging) {

            if (!isPopupDisplay) {

                return null;
            }

            return (

                <View style={_styles.popupCaller}>
                    {
                        !!connectMessage && 
                            <Message
                                type = {connectMessageType}
                            >{connectMessage}</Message>
                    }
                    <PopupCaller
                        acceptOnPress  = {this._acceptOnPress}
                        declineOnPress = {this._declineOnPress}
                        profileName    = {profileName}
                        callMessage    = {callMessage}
                        isConnected    = {isConnected}
                    />
                </View>
            );
        }

        return (
            <View style={_styles.wrapper}>
                {
                    !!connectMessage &&
                        <Message
                            type = {connectMessageType}
                        >{connectMessage}</Message>
                }
                <NavigationBar 
                    style              = {_styles.navigationBar}
                    isEnableVideo      = {isEnableVideo}
                    swichCameraOnPress = {this._swichCameraOnPress}
                    bandwidth          = {bandwidth}
                    maxBandwidth       = {maxBandwidth}
                    menuOnPress        = {this._menuOnPress}
                    message            = {""}
                >
                    {
                        connectTime > 0 && 
                            <Text style={_styles.timerMessage}>{timmer}</Text>
                    }
                </NavigationBar>
                <ScrollView 
                    style={_styles.container}
                    contentContainerStyle={_styles.contentContainerStyle}
                >
                    <Profile 
                        style       = {_styles.profile}
                        profileName = {profileName}
                    />
                    {
                        !!callMessage && 
                            <Text style={_styles.message}>{callMessage}</Text>
                    }
                    {
                        connectTime > 0 && 
                            <Text style={_styles.timer}>{timmer}</Text>
                    }
                </ScrollView>
                {
                    isRinging && 
                        <IncomingCallBar 
                            style          = {_styles.incomingBar}
                            acceptOnPress  = {this._acceptOnPress}
                            declineOnPress = {this._declineOnPress}
                            isConnected    = {isConnected}
                        />
                }
                {
                    isAnswered && 
                        <AnsweredCallBar 
                            style           = {_styles.answeredBar}
                            muteOnPress     = {this._muteOnPress}
                            isMuted         = {isMuted}
                            muteDisable     = {false}
                            speakerOnPress  = {this._speakerOnPress}
                            isEnableSpeaker = {isEnableSpeaker}
                            speakerDisable  = {false}
                            hangupOnPress   = {this._hangupOnPress}
                        />
                }
            </View>
        );
    }

    componentDidMount() {

        const {
            callId,
            from: From,
            isOutgoingCall,
            to,
            onEnded
        } = this.props;

        // lỗi param không có mã cuộc gọi
        if (!isOutgoingCall && !callId) {

            return onEnded && onEnded(callId);
        }

        // lỗi không có đối tượng
        if (!From || !to) {

            return onEnded && onEnded(callId);
        }

        NetInfo.isConnected.fetch()
            .then(this._networkHandle)
        ;
        this._networkEvent = NetInfo.isConnected.addEventListener("connectionChange", this._networkHandle);

        // listen event
        this._stringeeCall.addListener('onChangeSignalingState', this._onChangeSignalingState);
        this._stringeeCall.addListener('onChangeMediaState', this._onChangeMediaState);
        this._stringeeCall.addListener('onReceiveLocalStream', this._onReceiveLocalStream);
        this._stringeeCall.addListener('onReceiveRemoteStream', this._onReceiveRemoteStream);
        this._stringeeCall.addListener('onHandleOnAnotherDevice', this._onHandleOnAnotherDevice);
        this._stringeeCall.addListener('onTimeTick', this._onTimeTick);
        this._stringeeCall.addListener('onChangeBandwidth', this._onChangeBandwidth);

        this._makeOrAnswerCall();
    }

    componentDidUpdate( nextProps, prevState, snapshot ) {
        
    }

    componentWillUnmount() {

        this._networkEvent && this._networkEvent.remove && this._networkEvent.remove();
        this._stringeeCall.destroy();
    }

    /**
     * @todo Hàm khởi tạo cuộc gọi
     */
    _makeOrAnswerCall = () => {

        const {
            isVideoCall,
            isOutgoingCall,
            callId,
            from: From,
            to,
            onEnded,
            isPopup
        } = this.props;

        let callInfo = {
            callId: callId || CallManager.getInitCallID(),
            from: From,
            to,
            isVideoCall,
            videoResolution: "NORMAL",
            isOutgoingCall,
            isEnableSpeaker: isVideoCall || this.state.isEnableSpeaker
        };

        this._stringeeCall.setCallInfo(callInfo);

        // nếu là gọi đi
        if (isOutgoingCall) {

            // tạo cuộc gọi
            this._stringeeCall.makeCall(
                JSON.stringify(callInfo),
                (status, code, message, callId) => {

                    // nếu tạo cuộc gọi không thành công
                    if (!status) {
                        onEnded && onEnded(callId);
                        return;
                    }

                    // set loa ngoài nếu là video call
                    let isEnableSpeaker = isVideoCall || this.state.isEnableSpeaker;
                    this._stringeeCall.setCallInfo({
                        isEnableSpeaker
                    });
                    this.setState({
                        callId,
                        isEnableSpeaker
                    });
                }
            );
        } else { // nếu là cuộc gọi đến

            this._stringeeCall.initAnswer(callId, (status, code, message) => {

                if (!status) {

                    return onEnded && onEnded(callId);
                }

                let isEnableSpeaker = isVideoCall || this.state.isEnableSpeaker;
                this._stringeeCall.setCallInfo({
                    isEnableSpeaker
                });
                this.setState({
                    callId,
                    isEnableSpeaker
                });
            });
        }

        // nếu là cuộc gọi đến và trong trạng thái popup
        if (isPopup && !isOutgoingCall) {

            // tìm thông tin cuộc gọi đi mà có cùng 1 số điện thoại với cuộc gọi đến
            let checkCallInfo = CallManager.findCallInfo("to", From);

            // không hiển thị cuộc gọi có cùng 1 số điện thoại
            if (!(checkCallInfo && checkCallInfo.isOutgoingCall)) {

                this.setState({
                    isPopupDisplay: true
                });
            }
        }
    };

    /**
     * @todo sự kiện trạng thái cuộc gọi
     */
    _onChangeSignalingState = (e) => {

        const {
            callId,
            code
        } = e;

        // nếu không phải cuộc gọi hiện tại
        if (callId != this.state.callId) {

            return;
        }

        const {
            isOutgoingCall,
            onEnded,
            onHangup
        } = this.props;

        // message trạng thái cuộc gọi
        let callMessage = translate(CallStateCaller[code]);
        if (!isOutgoingCall) {

            callMessage = translate(CallStateRecipient[code]);
        }

        // trạng thái cuộc gọi
        this.setState({
            callState: code,
            callMessage
        }, () => {

            // nếu tắt máy
            if (code == 3 || code == 4) {

                onHangup && onHangup(callId);

                setTimeout(() => {

                    onEnded && onEnded(callId);
                }, 1000);
            }
        });
    };

    /**
     * @todo sự kiện trạng thái kết nối cuộc gọi
     */
    _onChangeMediaState = (e) => {

        const {
            callId,
            code
        } = e;

        // nếu không phải cuộc gọi hiện tại
        if (callId != this.state.callId) {

            return;
        }

        let connectMessage = "";
        let connectMessageType = null;

        if (
            !this.state.isConnected
            || code == 1
        ) {

            connectMessage = translate("caller.disconnected");
            connectMessageType = "error";
        } else if (
            this.state.isRemoteStreamConnected 
            && code == 1
        ) {

            connectMessage = translate("caller.reconnecting");
            connectMessageType = "warning";
        }

        this.setState({
            mediaState: code,
            callMessage: code == 0 ? "" : translate("caller.disconnected"),
            connectMessage,
            connectMessageType
        });
    };

    /**
     * @todo sự kiện stringee local đã kết nối thành công
     */
    _onReceiveLocalStream = (e) => {

        if (e.callId != this.state.callId) {

            return;
        }

        this.setState({
            isLocalStreamConnected: true
        });
    };

    /**
     * @todo sự kiện stringee remote đã kết nối thành công
     */
    _onReceiveRemoteStream = (e) => {

        if (e.callId != this.state.callId) {

            return;
        }

        this.setState({
            isRemoteStreamConnected: true
        });
    };

    /**
     * @todo sự kiện khi thao tác trên nhiều thiết bị
     */
    _onHandleOnAnotherDevice = (e) => {

        const {
            callId,
            code
        } = e;

        if (callId != this.state.callId) {

            return;
        }

        if (code != 1) {

            this.setState({
                callMessage: translate(AnotherState[code])
            }, () => {

                this.props.onEnded && this.props.onEnded(callId);
            });
        }
    };

    /**
     * @todo sự kiện timer tick
     */
    _onTimeTick = (e) => {

        const {
            callId,
            connectTime
        } = e || {};

        if (callId != this.state.callId) {

            return;
        }

        this.setState({
            connectTime
        });
    };

    /**
     * @todo sự kiện thay đổi băng thông
     */
    _onChangeBandwidth = (e) => {

        if (e.callId != this.state.callId) {

            return;
        }

        const {
            bandwidth
        } = e || {};

        this.setState({
            bandwidth
        });
    };

    /**
     * @todo sự kiện click nút menu
     */
    _menuOnPress = () => {

    };

    /**
     * @todo sự kiện click đổi camera
     */
    _swichCameraOnPress = () => {

        // nếu đã có callID thì gọi stringee
        if (this.state.callId) {

            this._stringeeCall.switchCamera(
                this.state.callId,
                (status, code, message) => {

                    if (status) {

                        this.setState({
                            cameraType: this.state.cameraType == RNCamera.Constants.Type.front ?
                                RNCamera.Constants.Type.back :
                                RNCamera.Constants.Type.front
                        });
                    }
                }
            );
        } else {

            this.setState({
                cameraType: this.state.cameraType == RNCamera.Constants.Type.front ?
                    RNCamera.Constants.Type.back :
                    RNCamera.Constants.Type.front
            });
        }
    };

    /**
     * @todo sự kiện click chấp nhận cuộc gọi
     */
    _acceptOnPress = () => {

        this._stringeeCall.answer(
            this.state.callId,
            (status, code, message) => {

                this.props.onAccept && this.props.onAccept(this.state.callId);

                if (!status) {

                    return this.props.onEnded && this.props.onEnded(this.state.callId);
                }

            }
        );
    };

    /**
     * @todo sự kiện click huỷ cuộc gọi
     */
    _declineOnPress = () => {

        if (this.state.isConnected) {

            this._stringeeCall.reject(
                this.state.callId,
                (status, code, message) => {

                    this.props.onDecline && this.props.onDecline(this.state.callId);

                    if (status) {

                        return this.props.onEnded && this.props.onEnded(this.state.callId);
                    }
                }
            );
        } else {

            this.props.onDecline && this.props.onDecline(this.state.callId);
            this.props.onEnded && this.props.onEnded(this.state.callId);

            this._stringeeCall.reject(
                this.state.callId,
                (status, code, message) => {
                }
            );
        }
    };

    /**
     * @todo sự kiện click tắt mở mic
     */
    _muteOnPress = () => {

        this._stringeeCall.mute(
            this.state.callId,
            !this.state.isMuted,
            (status, code, message) => {

                if (status) {
                    this.setState({
                        isMuted: !this.state.isMuted
                    });
                }
            }
        );
    };

    /**
     * @todo Hàm tắt mở loa ngoài
     */
    _speakerOnPress = () => {

        this._setSpeakerphoneOn(this.state.callId, !this.state.isEnableSpeaker);
    };

    /**
     * @todo Hàm tắt/ mở loa ngoài
     */
    _setSpeakerphoneOn = (callId, isEnableSpeaker = true) => {

        this._stringeeCall.setSpeakerphoneOn(
            callId,
            isEnableSpeaker,
            (status, code, message) => {

                if (status) {
                    this.setState({
                        isEnableSpeaker
                    });
                }
            }
        );
    };

    /**
     * @todo sự kiện click kết thúc cuộc gọi
     */
    _hangupOnPress = () => {

        if (this.state.isConnected) {

            this._stringeeCall.hangup(
                this.state.callId,
                (status, code, message) => {

                    this.props.onHangup && this.props.onHangup(this.state.callId);

                    if (status) {

                        return this.props.onEnded && this.props.onEnded(this.state.callId);
                    }
                }
            );
        } else {

            this.props.onHangup && this.props.onHangup(this.state.callId);
            this.props.onEnded && this.props.onEnded(this.state.callId);

            this._stringeeCall.hangup(
                this.state.callId,
                (status, code, message) => {

                }
            );
        }
    };

    /**
     * @todo trạng thái mạng
     */
    _networkHandle = (isConnected) => {

        let connectMessage = "";
        let connectMessageType = null;

        if (!isConnected) {

            connectMessage = translate("caller.disconnected");
            connectMessageType = "error";
        } else if (
            this.state.isRemoteStreamConnected 
            && this.state.mediaState == 1
        ) {

            connectMessage = translate("caller.reconnecting");
            connectMessageType = "warning";
        }

        this.setState({
            isConnected,
            connectMessage,
            connectMessageType
        });
    };
}

const _styles = {
    wrapper: {
        flex: 1,
        backgroundColor: colors.section.callBackground,
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 100
    },
    navigationBar: {
        height: scale(30)
    },
    container: {
        flex: 1
    },
    contentContainerStyle: {
        alignItems: "center"
    },
    profile: {
        marginBottom: scale(10)
    },
    message: {
        fontSize: fontSizes.normal,
        color: colors.text.sinkingNormal,
        textAlign: "center"
    },
    timer: {
        fontSize: fontSizes.large,
        fontWeight: "bold",
        color: colors.text.sinkingBold,
        textAlign: "center",
        marginTop: scale(10)
    },
    timerMessage: {
        fontSize: fontSizes.normal,
        color: colors.text.sinkingBold,
        textAlign: "center",
    },
    incomingBar: {
        marginBottom: scale(50)
    },
    answeredBar: {
        marginBottom: scale(5)
    },
    popupCaller: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        backgroundColor: colors.section.callPopupBackground
    }
};

const CallStateCaller = {
    0: "caller.connecting",
    1: "caller.ringing",
    2: "",
    3: "caller.busy",
    4: "caller.ended"
};

const CallStateRecipient = {
    0: "caller.calling",
    1: "caller.ringing",
    2: "",
    3: "caller.busy",
    4: "caller.ended"
};

const AnotherState = {
    1: "caller.ringing",
    2: "caller.answered_another_device",
    3: "caller.declined_another_device",
    4: "caller.ended_another_device"
};

/**
 * @todo Hàm chuyển thời gian đàm thoại thành chuỗi
 * @param {int} connectTime 
 */
const convertTime = (connectTime = 0) => {

    let minute = Math.floor(((connectTime / (1000 * 60)) /*% 60*/));
    let second = Math.floor(((connectTime / 1000) % 60));
    minute = minute ? `${minute}` : "0";
    second = second ? `${second}` : "0";

    second = second.padStart(2, "0");
    if (minute.length <= 1) {

        minute = minute.padStart(2, "0");
    }

    return `${minute} : ${second}`;
};

export default CallScene;