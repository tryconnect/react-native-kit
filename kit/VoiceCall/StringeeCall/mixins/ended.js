import InCallManager from '../../InCallManager';
import CallManager from '../../CallManager';

export default function (callId, fromEvent = false) {

    // id cuộc gọi đang xử lý
    let currentCallId = CallManager.getCurrentHandle();
    // có cuộc gọi GSM
    // let hasGSM = CallManager.hasGSMCallHandle();
    // tổng tất cả cuộc gọi
    // let totalCall = CallManager.getAllCallHandles().length;
    // thông tin cuộc gọi đang xử lý
    let currentCallInfo = CallManager.getCallInfo(currentCallId) || {};
    // thông tin cuộc gọi cần xử lý
    // let callInfo = CallManager.getCallInfo(callId) || {};

    // là cuộc gọi duy nhất
    // let isOnlyCall = (
    //     !currentCallId
    //     || (
    //         currentCallId == callId
    //         && totalCall <= 1
    //     )
    // );

    // stringee Speaker
    let isEnableCallSpeaker = currentCallInfo.isEnableSpeaker
                            || (!currentCallInfo.answered && !currentCallInfo.isOutgoingCall)
                            || false
    ;

    // all Speaker
    let isEnableSpeaker = isEnableCallSpeaker;

    // stringee Muted
    let isMutedCall = currentCallInfo.isMuted || false;

    // all Muted
    let isMuted = isMutedCall && !CallManager.isGSMCall(currentCallId);

    // tắt/ mở loa ngoài
    InCallManager.setSpeakerphoneOn(isEnableSpeaker);
    // tắt/ mở micro
    InCallManager.setMicrophoneMute(isMuted);
    
    // phát máy bận
    let busytone = fromEvent ? this.options.busyTone : this.options.hangupTone;
    InCallManager.stop(busytone, this.options.vibrateAlertPattern);

    if (
        currentCallId
        && currentCallId != callId
        && !CallManager.isGSMCall(currentCallId)
        && currentCallInfo
    ) {

        // if (CallManager.isGSMCall(callId)) {

            this._mapping.setSpeakerphoneOn(currentCallId, isEnableCallSpeaker, (status) => {
    
                InCallManager.setSpeakerphoneOn(isEnableSpeaker);
            });
    
            this._mapping.mute(currentCallId, isMutedCall, (status) => {
    
                InCallManager.setMicrophoneMute(isMuted);
            });
        // }

        switch (currentCallInfo.callState) {
            case undefined:
            case "":
            case 0:
                
                if (currentCallInfo.isOutgoingCall) {

                    InCallManager.start(
                        this.options.vibrateAlertPattern,
                        currentCallInfo.isVideoCall || currentCallInfo.isEnableVideo
                    );
                } else {

                    // mở nhạc chuông
                    InCallManager.startRingtone(
                        this.options.ringTone,
                        this.options.vibrateRingingPattern
                    );
                }
                break;

            case 1:
                if (currentCallInfo.isOutgoingCall) {

                    // mở nhạc chờ
                    InCallManager.startRingback(
                        this.options.ringBack,
                        currentCallInfo.isVideoCall || currentCallInfo.isEnableVideo
                    );
                } else {

                    // mở nhạc chuông
                    InCallManager.startRingtone(
                        this.options.ringTone,
                        this.options.vibrateRingingPattern
                    );
                }
                break;

            case 2:
                
                InCallManager.start(
                    this.options.vibrateAlertPattern,
                    currentCallInfo.isVideoCall || currentCallInfo.isEnableVideo
                );
                break;
        }
    }
};