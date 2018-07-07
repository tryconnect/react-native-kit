import { Platform } from 'react-native';

// sự kiện của package InCallManager
export const InCallManagerEvents = {
    "Proximity": "Proximity",
    "WiredHeadset": "WiredHeadset",
    "NoisyAudio": "NoisyAudio",
    "MediaButton": "MediaButton",
    "onAudioFocusChange": "onAudioFocusChange",
};

// sự kiện call của stringee
export const CallEvents = Platform.select({
    ios: {
        onChangeSignalingState: "didChangeSignalingState",
        onChangeMediaState: "didChangeMediaState",
        onReceiveLocalStream: "didReceiveLocalStream",
        onReceiveRemoteStream: "didReceiveRemoteStream",
        onReceiveDtmfDigit: "didReceiveDtmfDigit",
        onReceiveCallInfo: "didReceiveCallInfo",
        onHandleOnAnotherDevice: "didHandleOnAnotherDevice"
    },
    android: {
        onChangeSignalingState: "onSignalingStateChange",
        onChangeMediaState: "onMediaStateChange",
        onReceiveLocalStream: "onLocalStream",
        onReceiveRemoteStream: "onRemoteStream",
        onReceiveDtmfDigit: "onDTMF",
        onReceiveCallInfo: "onCallInfo",
        onHandleOnAnotherDevice: "onHandledOnAnotherDevice"
    }
});

// sự kiện thời gian
export const ClockEvents = {
    onTimeTick: "onTimeTick",
    onChangeBandwidth: "onChangeBandwidth"
};

export default {
    ...CallEvents,
    ...InCallManagerEvents,
    ...ClockEvents,
    "onRequestComfirmInfo": "onRequestComfirmInfo",
    "onAnswerComfirmInfo": "onAnswerComfirmInfo"
};