import { Dimensions, Platform, StatusBar } from 'react-native';
import isOrientationLandscape from './isOrientationLandscape';
import isIPhoneX from './isIPhoneX';
import isIPad from './isIPad';

export default () => {

    /**
    * This is a temporary workaround because we don't have a way to detect
    * if the status bar is translucent or opaque. If opaque, we don't need to
    * factor in the height here; if translucent (content renders under it) then
    * we do.
    */
    if (Platform.OS === 'android') {
        if (global.Expo) {
            return global.Expo.Constants.statusBarHeight;
        } else {
            return StatusBar.currentHeight;
        }
    }
    
    let isLandscape = isOrientationLandscape(Dimensions.get('window'));

    if (isIPhoneX()) {
        return isLandscape ? 0 : 44;
    }

    if (isIPad()) {
        return 20;
    }

    return isLandscape ? 0 : 20;
};