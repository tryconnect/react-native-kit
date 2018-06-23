import { NativeModules, NativeEventEmitter } from 'react-native';

const _CallDetectorManager = NativeModules.CallDetectionManager;

class CallDetectorManager {

    constructor() {

        this.eventEmitter = new NativeEventEmitter(_CallDetectorManager);
    }

    startListener = async () => {
        
        return await _CallDetectorManager.startListener();
    };

    stopListener = async () => {

        return await _CallDetectorManager.stopListener();
    };

    addListener = (eventName, handle, content) => {

        return this.eventEmitter.addListener(eventName, handle, content);
    };

    getCallState = async () => {

        return await _CallDetectorManager.getCallState();
    };
}

export default new CallDetectorManager();