import { Vibration } from 'react-native';
import InCallManager from 'react-native-incall-manager';

const RINGTONE_PATH = [
    "_BUNDLE_",
    "_DEFAULT_",
    "DEFAULT",
    "BUNDLE"
];

// backup handle
const startRingtone = InCallManager.startRingtone.bind(InCallManager);
const stopRingtone = InCallManager.stopRingtone.bind(InCallManager);
const stopRingback = InCallManager.stopRingback.bind(InCallManager);
const start = InCallManager.start.bind(InCallManager);
const stop = InCallManager.stop.bind(InCallManager);
const setKeepScreenOn = InCallManager.setKeepScreenOn.bind(InCallManager);
const setMicrophoneMute = InCallManager.setMicrophoneMute.bind(InCallManager);
const setSpeakerphoneOn = InCallManager.setSpeakerphoneOn.bind(InCallManager);

var deviceStates = {
    isMuted: false,
    isEnableSpeaker: false,
    isEnableProximity: false,
    isKeepScreenOn: false,
    isRingbackPlaying: false,
    isRingtonePlaying: false
};

/**
 * @todo hàm tắt/ mở loa
 * @param {boolean} isKeep 
 */
InCallManager.setSpeakerphoneOn = (on = false) => {
    // if (deviceStates.isEnableSpeaker !== on) {

        setSpeakerphoneOn(on);
    // }
    deviceStates.isEnableSpeaker = on;
};

/**
 * @todo hàm tắt/ mở micro
 * @param {boolean} isKeep 
 */
InCallManager.setMicrophoneMute = (isMuted = false) => {
    // if (deviceStates.isMuted !== isMuted) {

        setMicrophoneMute(isMuted);
    // }
    deviceStates.isMuted = isMuted;
};

/**
 * @todo hàm set giữ màn hình
 * @param {boolean} isKeep 
 */
InCallManager.setKeepScreenOn = (isKeep = false) => {
    // if (deviceStates.isKeepScreenOn !== isKeep) {
    
        setKeepScreenOn(isKeep);
    // }
    deviceStates.isKeepScreenOn = isKeep;
};

/**
 * @todo hàm hỗ trợ mở nhạc chuông
 */
InCallManager.startRingtone = (fileName, vibrateRingingPattern = null) => {

    if (!RINGTONE_PATH.includes(fileName)) {
        fileName = fileName ? "_BUNDLE_" : "_DEFAULT_";
    }

    startRingtone(fileName);
    deviceStates.isRingtonePlaying = true;
    InCallManager.setKeepScreenOn(true);
    Vibration.cancel();
    vibrateRingingPattern && Vibration.vibrate(vibrateRingingPattern, true);
};

/**
 * @todo hàm hỗ trợ tắt nhạc chuông
 */
InCallManager.stopRingtone = (vibrateAlertPattern = null) => {

    stopRingtone();
    deviceStates.isRingtonePlaying = false;
    stopRingback();
    deviceStates.isRingbackPlaying = false;
    InCallManager.setKeepScreenOn(false);
    Vibration.cancel();
    vibrateAlertPattern && Vibration.vibrate(vibrateAlertPattern);
};

/**
 * @todo hàm hỗ trợ mở nhạc chờ
 */
InCallManager.startRingback = (fileName, isVideoCall = false) => {

    if (!RINGTONE_PATH.includes(fileName)) {
        fileName = fileName ? "_BUNDLE_" : "_DEFAULT_";
    }

    stopRingtone();
    deviceStates.isRingtonePlaying = false;
    stopRingback();
    deviceStates.isRingbackPlaying = false;
    stop();
    deviceStates.isEnableProximity = false;
    InCallManager.setKeepScreenOn(isVideoCall);

    start({
        media: isVideoCall ? "video" : "audio",
        auto: true,
        ringback: fileName
    });
    deviceStates.isRingbackPlaying = true;
    deviceStates.isEnableProximity = true;
};

/**
 * @todo hàm hỗ trợ tắt nhạc chờ
 */
InCallManager.stopRingback = (vibrateAlertPattern = null) => {

    stopRingtone();
    deviceStates.isRingtonePlaying = false;
    stopRingback();
    deviceStates.isRingbackPlaying = false;
    InCallManager.setKeepScreenOn(false);
    Vibration.cancel();

    vibrateAlertPattern && Vibration.vibrate(vibrateAlertPattern);
};

/**
 * @todo hàm hỗ trợ mở event cảm biến
 */
InCallManager.start = (vibrateAlertPattern = null, isVideoCall = false) => {

    stopRingtone();
    deviceStates.isRingtonePlaying = false;
    stopRingback();
    deviceStates.isRingbackPlaying = false;
    stop();
    deviceStates.isEnableProximity = false;
    Vibration.cancel();
    vibrateAlertPattern && Vibration.vibrate(vibrateAlertPattern);

    start({
        media: isVideoCall ? "video" : "audio",
        auto: true,
        // ringback: ringBack ? "_BUNDLE_" : "_DEFAULT_"
    });
    deviceStates.isEnableProximity = true;

    InCallManager.setKeepScreenOn(isVideoCall);
};

/**
 * @todo hàm hỗ trợ mở event cảm biến
 */
InCallManager.stop = (fileName = null, vibrateAlertPattern = null) => {

    let option = undefined;
    if (fileName) {
        if (fileName !== "_DTMF_") {
            
            fileName = "_BUNDLE_";
        }
        option = {
            busytone: fileName
        };
    }

    stopRingtone();
    deviceStates.isRingtonePlaying = false;
    stopRingback();
    deviceStates.isRingbackPlaying = false;
    stop(option);
    deviceStates.isEnableProximity = false;
    InCallManager.setKeepScreenOn(false);
    Vibration.cancel();
    vibrateAlertPattern && Vibration.vibrate(vibrateAlertPattern);
};

/**
 * @todo Hàm lấy trạng thái service
 */
InCallManager.getDeviceStates = () => {

    return deviceStates;
};

export default InCallManager;