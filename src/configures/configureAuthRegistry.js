import { AsyncStorage } from 'react-native';
import { syncKey as accountSyncKey } from '~/configs/user';
import firebase from 'react-native-firebase';
import { AUTHORIZATION, AUTH_IDENTITY } from '~/constants/registryKey';
import { SET_AUTHORIZATION, SET_AUTH_IDENTITY } from '~/constants/authReducerKey';

export default (store) => {

    // sự kiện thay đổi token
    const handleChangeAuthorization = async (authorization = null) => {

        try {
            if (!authorization) {

                await AsyncStorage.removeItem(accountSyncKey);
            } else {

                await AsyncStorage.setItem(accountSyncKey, authorization);
            }
        } catch (error) { }

        store.dispatch({
            type: SET_AUTHORIZATION,
            payload: authorization
        });
    };

    // sự kiện thay đổi thông tin user
    const handleChangeAuthIdentity = (authIdentity = null) => {

        // report firebase
        if (!__DEV__ && authIdentity && typeof authIdentity === "object") {

            // khỏi tạo user report firebase
            const firebaseAnalytics = firebase.analytics();
            const userID = (authIdentity.id || authIdentity.account_id || authIdentity.user_id || authIdentity.customer_id);
            firebaseAnalytics.setUserId(`${userID}`);
            firebaseAnalytics.setUserProperty('token', Registry.get(AUTHORIZATION));

            for (let key in authIdentity) {
                if (authIdentity.hasOwnProperty(key)) {
                    firebaseAnalytics.setUserProperty(`${key}`, `${authIdentity[key]}`);
                }
            }

            firebaseAnalytics.setAnalyticsCollectionEnabled(true);
            firebaseAnalytics.logEvent("user_login", authIdentity);
        }

        // set lại user trên redux
        store.dispatch({
            type: SET_AUTH_IDENTITY,
            payload: authIdentity
        });
    };

    // add sự kiện thay đổi trên registry
    const eventChangeAuthorization = Registry.addEventListener('change', AUTHORIZATION, handleChangeAuthorization);
    const eventChangeAuthIdentity = Registry.addEventListener('change', AUTH_IDENTITY, handleChangeAuthIdentity);

    // init
    if (Registry.get(AUTHORIZATION)) {

        handleChangeAuthorization(Registry.get(AUTHORIZATION));
    }
    if (Registry.get(AUTH_IDENTITY)) {

        handleChangeAuthIdentity(Registry.get(AUTH_IDENTITY));
    }

    // sự kiện thay đổi token
    const eventDeleteAuthIdentity = Registry.addEventListener('delete', AUTHORIZATION, async () => {

        try {
            await AsyncStorage.removeItem(accountSyncKey);
        } catch (error) { }

        store.dispatch({
            type: SET_AUTHORIZATION,
            payload: null
        });
    });

    return {

        remove: () => {

            eventChangeAuthorization && eventChangeAuthorization.remove();
            eventChangeAuthIdentity && eventChangeAuthIdentity.remove();
            eventDeleteAuthIdentity && eventDeleteAuthIdentity.remove();
        }
    };
};