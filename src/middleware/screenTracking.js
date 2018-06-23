import { NavigationActions } from 'react-navigation';
//import { GoogleAnalyticsTracker } from 'react-native-google-analytics-bridge';
import getRoute from '~/utilities/getRoute';
import objectToQueryString from '~/utilities/objectToQueryString';
import DeviceInfo from 'react-native-device-info';
import firebase from 'react-native-firebase';
import {
    Analytics,
    Hits as GAHits,
    Experiment as GAExperiment
} from 'react-native-google-analytics';
import { googleAnalyticsID } from '~/configs/application';
// import Registry from '~/library/Registry';
// import {
//     GoogleAnalyticsTracker,
//     GoogleTagManager,
//     GoogleAnalyticsSettings
// } from 'react-native-google-analytics-bridge';

const readableVersion = DeviceInfo.getReadableVersion();
const bundleId = DeviceInfo.getBundleId();
const clientId = DeviceInfo.getUniqueID();
const userAgent = DeviceInfo.getUserAgent();
const version = 1;

// khởi tạo ga
ga = new Analytics(googleAnalyticsID, clientId, version, userAgent);

const appName = 'ITVINADriver';

// const tracker1 = new GoogleAnalyticsTracker(googleAnalyticsID);
// GoogleAnalyticsSettings.setDispatchInterval(1);
// tracker1.setAppName(appName);
// tracker1.setClient(clientId);

const screenTracking = ({ getState }) => next => (action) => {

    // check redux navigation action
    if (
        action.type !== NavigationActions.INIT
        && action.type !== NavigationActions.NAVIGATE
        && action.type !== NavigationActions.BACK
        && action.type !== NavigationActions.RESET
        && action.type !== NavigationActions.SET_PARAMS
        && action.type !== (NavigationActions.REPLACE || "Navigation/REPLACE")
    ) {
        return next(action);
    }

    // // lấy màn hình hiện tại
    const currentScreen = getRoute(getState()["$$navigation"]);

    // lấy next state
    const result = next(action);

    // lấy màn hình đang chuyển đến
    const nextScreen = getRoute(getState()["$$navigation"]);

    // prev param
    let {
        params,
        routeName
    } = currentScreen || {};
    params = params && Object.keys(params).length ? objectToQueryString(params) : '';

    // next param
    let {
        params: nextParams,
        routeName: nextRouteName
    } = nextScreen || {};
    nextParams = nextParams && Object.keys(nextParams).length ? objectToQueryString(nextParams) : '';

    // tên màn hình
    let screenName = "";

    // nếu là đổi sàn hoặc chọn loại
    if (
        action.type == NavigationActions.SET_PARAMS
        && params !== nextParams
    ) {

        screenName = `${nextRouteName}${nextParams ? '?' + nextParams : ''}`;
    } 
    
    // nếu qua trang khác
    else if(
        action.type === NavigationActions.INIT
        || routeName != nextRouteName 
        || params !== nextParams
    ){

        screenName = `${nextRouteName}${nextParams ? '?' + nextParams : ''}`;
    }

    // nếu có name thì report
    if (screenName) {

        // let userID = (Registry.get('authIdentity') && (Registry.get('authIdentity').id || Registry.get('authIdentity').account_id)) || null;
        // userID && tracker1.setUser(`${userID}`);
        // tracker1.trackScreenView(screenName);

        let screenView = new GAHits.ScreenView(
            appName,
            screenName,
            readableVersion,
            bundleId
        );
        ga.send(screenView);
        
        // https://rnfirebase.io/docs/v3.2.x/analytics/reference/analytics
        const firebaseAnalytics = firebase.analytics();
        firebaseAnalytics.setAnalyticsCollectionEnabled(true);
        firebaseAnalytics.setMinimumSessionDuration(10000);
        firebaseAnalytics.setSessionTimeoutDuration(450000);
        firebaseAnalytics.setCurrentScreen(screenName);
        firebaseAnalytics.logEvent("screen_tracking", {screenName});
    }

    return result;
};

export default screenTracking;