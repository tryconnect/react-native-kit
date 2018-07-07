import { BackHandler, Alert } from 'react-native';
import { NavigationActions } from 'react-navigation';

export default ( store ) => {

    var backCounter = 0;
    var backTimeout = undefined;
    var alertIsShow = false;

    var backHandler = BackHandler.addEventListener('hardwareBackPress', (e, b) => {

        backCounter++;

        // nếu back về 2 lần
        if (backCounter >= 2 && !alertIsShow) {

            alertIsShow = true;

            Alert.alert(
                translate("alert.exit_title"),
                translate("alert.exit_message"),
                [
                    {
                        text: translate("alert.exit_ok"), 
                        onPress: () => {

                            alertIsShow = false;
                            BackHandler.exitApp();
                        }
                    },
                    {
                        text: translate("alert.exit_cancel"), 
                        onPress: () => {

                            if (backTimeout) {
                                clearTimeout(backTimeout);
                                backTimeout = undefined;
                                backCounter = 0;
                            }

                            alertIsShow = false;

                        }, 
                        style: 'cancel'
                    }
                ],
                { cancelable: false }
            );

            return true;
        }

        // clear time out
        if (backTimeout) {

            clearTimeout(backTimeout);
            backTimeout = undefined;
        }

        // set time out đề nhận biết double click back
        backTimeout = setTimeout(() => {

            if (backTimeout) {
                clearTimeout(backTimeout);
                backTimeout = undefined;
            }
            backCounter = 0;
        }, 250);

        store.dispatch(NavigationActions.back());

        return true;
    });

    return {
        remove: () => {

            if (backHandler && backHandler.remove) {

                backHandler.remove();
            }
            if (backTimeout) {
                clearTimeout(backTimeout);
                backTimeout = undefined;
            }
            backCounter = 0;
        }
    };
};