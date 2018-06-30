import SplashScreen from 'react-native-smart-splash-screen';
import thunk from 'redux-thunk';
import { createReactNavigationReduxMiddleware } from 'react-navigation-redux-helpers';

export default {

    "env": "develop", // develop, production
    "debug": true,

    "redux": {
        'middleware': [
            thunk,
            createReactNavigationReduxMiddleware('$$navigation', state => state["$$navigation"])
        ]
    },

    "codePush": {
        // cài đặt ngay sau khi download dùng cho package bắt buộc
        // "resolvedInstallMode": codePush.InstallMode.IMMEDIATE,

        // số giây tối thiểu ứng dụng cần phải chạy nền trước khi khởi động lại
        // "minimumBackgroundDuration": 60 * 5,

        // hàm callback khi khởi động lần đầu
        firstRunCallback: () => {},

        // cho phép xoá cache
        "clearCache": true,

        // danh sách cache bỏ qua khi xoá
        "cacheWhitelist": [

        ],

        "deploymentKey": null,

        generateMessage(version) {

            return {
                optional_update_title: `Cập nhật ${version}`,
                mandatory_update_title: `Cập nhật`,
                // cập nhật bắt buộc
                mandatory_update_message: "Vui lòng cập nhật",
                optional_update_message: "Vui lòng cập nhật",
                optional_ignore_button_label: "bỏ qua",
                optional_install_button_label: "cài đặt"
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
            // "en": "https://raw.githubusercontent.com/ro31337/libretaxi/master/locales/en.json"
        },
        "downloader": "translations"
    },

    // downloader
    "downloaders": {
        "images": {
            "fileCache": false,
            "method": "GET",
            "cache": "images"
        },
        "translations": {
            "fileCache": false,
            "method": "GET",
            "cache": "translations"
        },
    },

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
        require("~/kit/Providers/ExceptionHandle").default,
        require("~/kit/Providers/FirebaseCrashReport").default,
        require("~/kit/Providers/CacheManager").default,
        require("~/kit/Providers/Downloaders").default,
        require("~/kit/Providers/Translator").default,
        require("~/kit/Providers/DownloadTranslation").default,
        require("~/kit/Providers/SplashScreen").default,
        require("~/kit/Providers/Navigation").default,
        require("~/kit/Providers/Redux").default,
        require("~/kit/Providers/CodePush").default,
        require("~/providers/App").default,
    ],

    // alias
    "aliases": {
        
    }
};