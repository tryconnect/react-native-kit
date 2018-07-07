import { Platform } from 'react-native';
import ServiceProvider from '~/kit/Support/ServiceProvider';
import axios from 'axios';
import DeviceInfo from 'react-native-device-info';

class HttpClientServiceProvider extends ServiceProvider {

    constructor(application) {
        super(application);

        axios.defaults.headers.common["platform"] = Platform.OS;
        axios.defaults.headers.common["Accept"] = "application/json";
        axios.defaults.headers.common["Content-Type"] = "application/x-www-form-urlencoded";
        axios.defaults.validateStatus = (status) => (status >= 200 && status < 300);
        axios.defaults.headers.common["Timezone"] = DeviceInfo.getTimezone();
        axios.defaults.headers.common["Country"] = DeviceInfo.getDeviceCountry();
        axios.defaults.headers.common["User-Agent"] = DeviceInfo.getUserAgent();
        axios.defaults.params = {};

        application.alias("axios", (configs = {}) => {

            const source = axios.CancelToken.source();

            deferred = axios({
                ...configs,
                cancelToken: source.token
            });

            deferred.abort = (message) => source.cancel(message);
            deferred.cancel = (message) => source.cancel(message);
            deferred.isCancel = thrown => axios.isCancel(thrown);
            return deferred;
        });
    }

    async register() {

        const translator = app("translator");
        axios.defaults.headers.common["hl"] = translator.locale;

        translator.onChangeLocale(() => {

            axios.defaults.headers.common["hl"] = translator.locale;
        });

        if(auth.check() && auth.user()) {
            
            const user = auth.user();
            axios.defaults.headers.common["authorization"] = user.getRememberToken();
        }

        auth.addListener(auth.EVENTS.LOGIN, () => {

            const user = auth.user();
            if (user) {

                axios.defaults.headers.common["authorization"] = user.getRememberToken();
            }
        });

        auth.addListener(auth.EVENTS.LOGOUT, () => {

            axios.defaults.headers.common["authorization"] = undefined;
        });
    }
}

export default HttpClientServiceProvider;