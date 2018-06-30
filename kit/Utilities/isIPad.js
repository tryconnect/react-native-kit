import {
    Dimensions,
    Platform
} from 'react-native';

// See https://mydevice.io/devices/ for device dimensions
// const X_WIDTH = 375;
// const X_HEIGHT = 812;
const PAD_WIDTH = 768;
// const PAD_HEIGHT = 1024;

const { height: D_HEIGHT, width: D_WIDTH } = Dimensions.get('window');

import isIPhoneX from './isIPhoneX';

export default () => {
    if (Platform.OS !== 'ios' || isIPhoneX()) return false;

    // if landscape and height is smaller that iPad height
    if (D_WIDTH > D_HEIGHT && D_HEIGHT < PAD_WIDTH) {
        return false;
    }

    return true;
};