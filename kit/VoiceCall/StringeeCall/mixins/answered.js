import InCallManager from '../../InCallManager';
import CallManager from '../../CallManager';

export default function (callId, staffCallId) {

    // id cuộc gọi đang xử lý
    let currentCallId = CallManager.getCurrentHandle();
    // có cuộc gọi GSM
    // let hasGSM = CallManager.hasGSMCallHandle();
    // tổng tất cả cuộc gọi
    // let totalCall = CallManager.getAllCallHandles().length;
    // thông tin cuộc gọi đang xử lý
    // let currentCallInfo = CallManager.getCallInfo(currentCallId) || {};
    // thông tin cuộc gọi cần xử lý
    let callInfo = CallManager.getCallInfo(callId) || {};
    // thông tin cuộc gọi đang listen
    // let staffCallInfo = CallManager.getCallInfo(staffCallId) || {};

    // là cuộc gọi duy nhất
    // let isOnlyCall = (
    //     !currentCallId
    //     || (
    //         currentCallId == callId
    //         && totalCall <= 1
    //     )
    // );

    // stringee Speaker
    let isEnableCallSpeaker = (callInfo.isEnableSpeaker && !CallManager.isGSMCall(currentCallId))
                                || false
    ;

    // all Speaker
    let isEnableSpeaker = isEnableCallSpeaker;

    // stringee Muted
    let isMutedCall = callInfo.isMuted || CallManager.isGSMCall(currentCallId);

    // all Muted
    let isMuted = isMutedCall && !CallManager.isGSMCall(currentCallId);

    // tắt/ mở loa ngoài
    InCallManager.setSpeakerphoneOn(isEnableSpeaker);
    // tắt/ mở micro
    InCallManager.setMicrophoneMute(isMuted);

    if (!CallManager.isGSMCall(callId)) {

        this._mapping.setSpeakerphoneOn(callId, isEnableCallSpeaker, (status) => {

            InCallManager.setSpeakerphoneOn(isEnableSpeaker);
        });
    }

    if (callId == staffCallId) {

        this._mapping.mute(callId, isMutedCall, (status) => {

            InCallManager.setMicrophoneMute(isMuted);
        });

    } else if( 
        staffCallId &&
        callId != staffCallId
        && !CallManager.isGSMCall(staffCallId)
     ) {

        // hold cuộc gọi
        this._mapping.setSpeakerphoneOn(staffCallId, isEnableCallSpeaker, (status) => {

            InCallManager.setSpeakerphoneOn(isEnableSpeaker);
        });

        this._mapping.mute(staffCallId, true, (status) => {

            InCallManager.setMicrophoneMute(isMuted);
        });
    } 

    // tắt các service hiện tại
    InCallManager.stop();

    InCallManager.start(
        this.options.vibrateAlertPattern,
        callInfo.isVideoCall || callInfo.isEnableVideo
    );
};