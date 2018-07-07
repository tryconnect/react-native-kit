// import InCallManager from 'react-native-incall-manager';
import { PermissionsAndroid, Platform } from 'react-native';
import Permissions from 'react-native-permissions';

const convertState = (granted) => {
    if (
        granted === true
        || granted === PermissionsAndroid.RESULTS.GRANTED
    ) {
        granted = "authorized";
    } else {
        granted = "denied";
    }

    return granted;
};
export default async (incomingCall = false, isVideo = false, rationale = {}, permissionDeniedCallback) => {

    let notification = "denied";
    let microphone = "denied";
    let camera = "denied";
    let record = "authorized";
    let phoneState = "authorized";
    rationale = rationale || {};

    if (Platform.OS == "android") {

        // check quyền ghi âm
        try {

            phoneState = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE);
            phoneState = convertState(phoneState);

            if (phoneState !== "authorized") {

                phoneState = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE,
                    rationale.phoneState
                );
            }

            phoneState = convertState(phoneState);

            if (phoneState !== "authorized" && permissionDeniedCallback) {
                permissionDeniedCallback('phoneState');
            }
        } catch (error) { }
    }

    // check quyền thông báo
    try {
        notification = await Permissions.check('notification', { type: ['alert'] });
        if (notification !== "authorized") {

            notification = await Permissions.request('notification', { 
                type: ['alert'],
                rationale: rationale.notification
            });
        }
        if (notification !== "authorized" && permissionDeniedCallback) {
            permissionDeniedCallback('notification');
        }
    } catch (error) {}

    // nếu đang trong cuộc gọi
    if (incomingCall) {

        // check quyền micro
        try {
            microphone = await Permissions.check('microphone');
            microphone = convertState(microphone);

            if (microphone !== "authorized") {

                microphone = await Permissions.request('microphone', {
                    rationale: rationale.microphone
                });
            }

            microphone = convertState(microphone);

            if (microphone !== "authorized" && permissionDeniedCallback) {
                permissionDeniedCallback('microphone');
            }
        } catch (error) { }

        // check quyền ghi âm
        // try {
        //     record = await InCallManager.checkRecordPermission();
        //     if (record !== 'granted') {
        //         record = await InCallManager.requestRecordPermission();
        //     }
        //     record = record == "granted" ? "authorized" : record;
        // } catch (error) { }
        if(Platform.OS == "android") {

            // check quyền ghi âm
            try {

                record = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO);
                record = convertState(record);

                if (record !== "authorized") {

                    record = await PermissionsAndroid.request(
                        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO, 
                        rationale.record
                    );
                }

                record = convertState(record);

                if (record !== "authorized" && permissionDeniedCallback) {
                    permissionDeniedCallback('record');
                }
            } catch (error) { }
        }

        // nếu là video check quyền camera
        if (isVideo) {

            try {
                camera = await Permissions.check('camera');
                camera = convertState(camera);
                if (camera !== "authorized") {

                    camera = await Permissions.request('camera', {
                        rationale: rationale.camera
                    });
                }
                camera = convertState(camera);

                if (camera !== "authorized" && permissionDeniedCallback) {
                    permissionDeniedCallback('camera');
                }
            } catch (error) { }
        }
    }

    return {
        notification,
        microphone,
        camera,
        record,
        phoneState
    };
};