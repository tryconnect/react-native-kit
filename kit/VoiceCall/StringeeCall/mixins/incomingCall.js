import { Vibration } from 'react-native';
import InCallManager from '../../InCallManager';
import CallManager from '../../CallManager';

export default function (callId, staffCallId) {

    // id cuộc gọi đang xử lý
    let currentCallId = CallManager.getCurrentHandle();
    // có cuộc gọi GSM
    let hasGSM = CallManager.hasGSMCallHandle();
    // tổng tất cả cuộc gọi
    let totalCall = CallManager.getAllCallHandles().length;
    // thông tin cuộc gọi đang xử lý
    let currentCallInfo = CallManager.getCallInfo(currentCallId) || {};
    // thông tin cuộc gọi cần xử lý
    let callInfo = CallManager.getCallInfo(callId) || {};
    // thông tin cuộc gọi đang listen
    let staffCallInfo = CallManager.getCallInfo(staffCallId) || {};

    // là cuộc gọi duy nhất
    let isOnlyCall = (
        !currentCallId
        || (
            currentCallId == callId
            && totalCall <= 1
        )
    );

    // stringee Speaker
    let isEnableCallSpeaker = !callInfo.isOutgoingCall 
                            || callInfo.isEnableSpeaker 
                            || false
    ;

    // all Speaker
    let isEnableSpeaker = isEnableCallSpeaker;

    // stringee Muted
    let isMutedCall = staffCallInfo.isMuted || false;

    // all Muted
    let isMuted = isMutedCall && !CallManager.isGSMCall(currentCallId);

    // nếu không phải duy nhất 1 cuộc gọi
    if ( !isOnlyCall  ) {

        // Speaker
        isEnableSpeaker =
                        // cuộc gọi hiện tại không phải là GSM
                        // và chưa đàm thoại
                        // và cuộc gọi cần xử lý là GSM
                        // hoặc cuộc gọi cần xử lý là cuộc gọi đến
                        (
                            !CallManager.isGSMCall(currentCallInfo.callId)
                            && !currentCallInfo.answered 
                            && (
                                CallManager.isGSMCall(callId) ||
                                !callInfo.isOutgoingCall
                            )
                        ) 
                        // hoặc lấy theo cuộc gọi hiện tại
                        || currentCallInfo.isEnableSpeaker 
                        || false
        ;

        isEnableCallSpeaker = isEnableSpeaker;
        isMuted = false;
        isMutedCall = staffCallInfo.isMuted || false;
    }

    // tắt/ mở loa ngoài
    InCallManager.setSpeakerphoneOn(isEnableSpeaker);
    // tắt/ mở micro
    InCallManager.setMicrophoneMute(isMuted);

    if (!CallManager.isGSMCall(staffCallId)) {

        this._mapping.setSpeakerphoneOn(staffCallId, isEnableCallSpeaker, (status) => {
    
            InCallManager.setSpeakerphoneOn(isEnableSpeaker);
        });
        
        this._mapping.mute(staffCallId, isMutedCall, (status) => {
    
            InCallManager.setMicrophoneMute(isMuted);
        });
    }

    // tắt các service hiện tại
    InCallManager.stop();

    if (isOnlyCall) {

        if (!CallManager.isGSMCall(callId)) {

            if (callInfo.isOutgoingCall) {
    
                if (callInfo.callState == 1) {

                    // mở nhạc chờ
                    InCallManager.startRingback(
                        this.options.ringBack,
                        callInfo.isVideoCall || callInfo.isEnableVideo
                    );
                } else {

                    InCallManager.start(
                        null,
                        callInfo.isVideoCall || callInfo.isEnableVideo
                    );
                }
            } else {

                // mở nhạc chuông
                InCallManager.startRingtone(
                    this.options.ringTone, 
                    this.options.vibrateRingingPattern
                );
            }
        }
        return;
    }

    if (
        (
            currentCallInfo.answered
            || hasGSM
        )
        // && !CallManager.isGSMCall(currentCallId)
    ) {
        if (
            currentCallInfo.answered
            || callInfo.isOutgoingCall
            || currentCallInfo.isOutgoingCall
        ) {

            InCallManager.start(
                null, 
                currentCallInfo.isVideoCall || currentCallInfo.isEnableVideo
            );
        }

        if ( !callInfo.isOutgoingCall ) {

            Vibration.vibrate(this.options.vibrateRingingPattern, true);
        }
    } else if (!currentCallInfo.answered && !CallManager.isGSMCall(currentCallId)){

        if (callInfo.isOutgoingCall) {

            if (callInfo.callState == 1) {

                // mở nhạc chờ
                InCallManager.startRingback(
                    this.options.ringBack,
                    callInfo.isVideoCall || callInfo.isEnableVideo
                );
            } else {

                InCallManager.start(
                    null,
                    callInfo.isVideoCall || callInfo.isEnableVideo
                );
            }
        } else {

            // mở nhạc chuông
            InCallManager.startRingtone(
                this.options.ringTone,
                this.options.vibrateRingingPattern
            );
        }
    }
};