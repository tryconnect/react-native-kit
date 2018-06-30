import {
    DeviceInfo,
    Dimensions,
    NativeModules,
    Platform
} from 'react-native';

// See https://mydevice.io/devices/ for device dimensions
const X_WIDTH = 375;
const X_HEIGHT = 812;

const { PlatformConstants = {} } = NativeModules;
const { minor = 0 } = PlatformConstants.reactNativeVersion || {};
const { height: D_HEIGHT, width: D_WIDTH } = Dimensions.get('window');

export default () => {
    
    if (Platform.OS === 'web' || Platform.OS === "android") return false;

    if (minor >= 50) {
        return DeviceInfo.isIPhoneX_deprecated;
    }

    return (
        Platform.OS === 'ios' &&
            ((D_HEIGHT === X_HEIGHT && D_WIDTH === X_WIDTH) ||
                (D_HEIGHT === X_WIDTH && D_WIDTH === X_HEIGHT))
    );
};