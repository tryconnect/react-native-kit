import axios from 'axios';
import { Platform } from 'react-native';
import deviceID from '~/utilities/deviceID';
import I18n from '~/library/i18n/I18n';
import DeviceInfo from 'react-native-device-info';
import { itemPerPage } from '~/configs/application';
import { AUTHORIZATION } from '~/constants/registryKey';

export default () => {

    // default header
    axios.defaults.headers.common["platform"] = Platform.OS;
    axios.defaults.headers.common["deviceid"] = deviceID;
    axios.defaults.headers.common["Accept"] = "application/json";
    axios.defaults.headers.common["Content-Type"] = "application/x-www-form-urlencoded";
    axios.defaults.validateStatus = (status) => (status >= 200 && status < 300);
    axios.defaults.headers.common["hl"] = I18n.locale;
    axios.defaults.headers.common["Timezone"] = DeviceInfo.getTimezone();
    axios.defaults.headers.common["Country"] = DeviceInfo.getDeviceCountry();
    axios.defaults.headers.common["User-Agent"] = DeviceInfo.getUserAgent();
    axios.defaults.params = {};
    axios.defaults.params['item-per-page'] = itemPerPage;

    // sự kiện thay đổ token
    const handleChangeAuthorization = async (authorization = null) => {

        // đổi lại header
        axios.defaults.headers.common["Authorization"] = authorization;
    };

    const eventChangeAuthorization = Registry.addEventListener('change', AUTHORIZATION, handleChangeAuthorization);
    const eventDeleteAuthorization = Registry.addEventListener('delete', AUTHORIZATION, () => {

        axios.defaults.headers.common["Authorization"] = undefined;
    });

    // init
    if (Registry.get(AUTHORIZATION)) {

        handleChangeAuthorization(Registry.get(AUTHORIZATION));
    }

    // sự kiện thay đổi ngôn ngữ
    const eventChangeLocale = I18n.onChangeLocale(() => {

        axios.defaults.headers.common["hl"] = I18n.locale;
    });

    return {

        remove: () => {

            eventChangeAuthorization && eventChangeAuthorization.remove();
            eventChangeLocale && eventChangeLocale.remove();
            eventDeleteAuthorization && eventDeleteAuthorization.remove();
        }
    };
};