import { Alert } from 'react-native';
import SplashScreen from 'react-native-smart-splash-screen';
import thunk from 'redux-thunk';
import { createReactNavigationReduxMiddleware } from 'react-navigation-redux-helpers';

export default {

    "env": __DEV__ ? "develop" : "production", // develop, production
    "debug": __DEV__,

    "auth": {
        "storage": "auth"
    },

    // config redux
    "redux": {
        "middleware": [
            thunk,
            createReactNavigationReduxMiddleware('$$navigation', state => state["$$navigation"])
        ],
        "persist": require("~/configs/reduxPersist"),
        "logic": {
            deps: { //optional injected dependencies for logic

            },
            arrLogic: [] // 
        }
    },

    "codePush": {
        // cài đặt ngay sau khi download dùng cho package bắt buộc
        // "resolvedInstallMode": codePush.InstallMode.IMMEDIATE,

        // số giây tối thiểu ứng dụng cần phải chạy nền trước khi khởi động lại
        // "minimumBackgroundDuration": 60 * 5,

        // hàm callback khi khởi động lần đầu
        firstRunCallback: (status) => {

            const codePush = require("react-native-code-push");
            switch (status) {
                case codePush.SyncStatus.UPDATE_INSTALLED:

                    Alert.alert(
                        translate("code_push.first_run_title_installed"),
                        translate("code_push.first_run_message_installed")
                    );
                    break;
                case codePush.SyncStatus.UNKNOWN_ERROR:

                    Alert.alert(
                        translate("code_push.first_run_title_error"),
                        translate("code_push.first_run_message_error")
                    );
                    break;
            }
        },

        // cho phép xoá cache
        "clearCache": true,

        // danh sách cache bỏ qua khi xoá
        "cacheWhitelist": [

        ],

        "deploymentKey": null,

        generateMessage(version) {

            return {
                optional_update_title: translate("code_push.optional_update_title", {
                    version
                }),
                mandatory_update_title: translate("code_push.optional_update_title", {
                    version
                }),
                mandatory_update_message: translate("code_push.mandatory_update_message"),
                optional_update_message: translate("code_push.optional_update_message"),
                optional_ignore_button_label: translate("code_push.optional_ignore_button_label"),
                optional_install_button_label: translate("code_push.optional_install_button_label")
            };
        },

        binaryVersionMismatchCallback() {

        }
    },

    // config splashScreen
    "splashScreen": {
        animationType: SplashScreen.animationType.none,
        duration: 500,
        delay: 20
    },

    // translation
    "translator": {
        "defaultLocale": "en",
        "locale": "vi",
        "fallbacks": true, // boolean, function
        // "no": (locale) => ("en"),
        "translations": {
            "vi": require("~/data/translations/vi"),
            "en": "https://raw.githubusercontent.com/ro31337/libretaxi/master/locales/en.json"
        },
        "downloader": "translations"
    },

    // downloader
    "downloaders": require("~/configs/downloaders"),

    // cache
    "cacheManager": {
        "drivers": {
            "File": require("~/kit/Cache/Adapter/File").default,
            "LocalStore": require("~/kit/Cache/Adapter/LocalStore").default,
            "Memory": require("~/kit/Cache/Adapter/Memory").default
        },
        "caches": require("~/configs/cache")
    },

    // service provider
    "providers": [
        require("~/kit/Providers/RestartManager").default,
        // require("~/kit/Providers/ExceptionHandle").default,
        // require("~/kit/Providers/FirebaseCrashReport").default,
        require("~/kit/Providers/CacheManager").default,
        require("~/kit/Providers/Downloaders").default,
        require("~/kit/Providers/Translator").default,
        require("~/kit/Providers/SplashScreen").default,
        // require("~/kit/Providers/DownloadTranslation").default,

        require("~/providers/User").default,
        require("~/providers/HttpClient").default,
        require("~/providers/Stringee").default,

        // require("~/kit/Providers/CodePush").default,

        require("~/kit/Providers/Navigation").default,
        // require("~/kit/Providers/Redux").default,
        // require("~/kit/Providers/ReduxLogic").default,
        // require("~/kit/Providers/ReduxPersist").default,

        require("~/providers/App").default,
    ],

    // alias
    "aliases": {

    },

    "polyfill": [
        require("~/kit/Polyfill/String/padStart").default,
    ]
};