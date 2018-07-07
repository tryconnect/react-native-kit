export default {
    autoCheckPermissions: true,
    ringBack: "incallmanager_ringback.mp3", // tên file nhạc chờ
    ringTone: "incallmanager_ringtone.mp3", // tên file nhạc chuông
    busyTone: "_DTMF_", // tên file nhạc máy bận
    hangupTone: "incallmanager_busytone.mp3", // tên file nhạc hangup
    vibrateRingingPattern: [2000, 1000], // thời gian rung chuông
    vibrateAlertPattern: [1000], // thời gian rung cảnh báo
    autoEndCallWhenReconnect: true, // khi nhấn kết thúc nhưng không có kết nối, thì khi có kết nối lại sẽ tự gọi lại
    endCallWhenDisconnect: true, // kết thúc cuộc gọi khi mất kết nối
    permistionRationale: {},
    permissionDeniedCallback: () => {}
};