import I18n from '~/library/i18n/I18n';
import { defaultLocale, locales, fallbacks, syncKey } from '~/configs/i18n';
import Downloader from '~/library/Downloader';
// import DeviceInfo from 'react-native-device-info';

// require ngôn ngữ trong js
requireLocale = (locale) => {

    switch (locale) {
        case "en":
            
            return require("~/data/translations/en");
        case "vi":

            return require("~/data/translations/vi");
        default:
            return {};
    }
};

/**
 * @todo hàm set lại dữ liệu ngôn ngữ
 */
const setTranslation = (locale, data) => {

    var translation = I18n.getTranslation(locale) || {};
    data = data || {};

    I18n.setTranslation(locale, {
        ...translation,
        ...data
    });
};

// sự kiện thay đổi ngôn ngữ
const changeLocale = async (locale) => {

    if (I18n.loadTranslation) {

        // download
        const data = await I18n.loadTranslation(locale);
        if (data && typeof data === "object") {

            // set lại dữ liệu ngôn ngữ hiện tại
            setTranslation(locale, data);
            return locale;
        }
    }

    return defaultLocale;
};

if (!I18n.getTranslation(defaultLocale)) {

    setTranslation(defaultLocale, requireLocale(defaultLocale));
}

// init
I18n.fallbacks = fallbacks;
I18n.defaultLocale = defaultLocale;
I18n.locale = defaultLocale;

export default async (options = {}) => {

    const I18nCache = await CacheManager.resolve("i18n");
    const LangCache = await CacheManager.resolve("language");

    // khởi tạo downloader
    const downloader = new Downloader(options, I18nCache);

    // hàm download ngôn ngữ từ server về
    I18n.loadTranslation = async (locale, downloadCallback) => {

        downloadCallback = downloadCallback || options.downloadCallback;

        // kiểm tra support
        locale = I18n.lookupWithoutFallback(locale, locales) || defaultLocale;

        // lấy đường dẫn download
        const urlDownload = locales[locale];
        if (!urlDownload) {
            return null;
        }

        var data = null;

        try {

            // kiểm tra cache
            const hasCache = await I18nCache.has(urlDownload);
            if (!hasCache) {

                // download
                await downloader.download(urlDownload, {
                    progress: (progress) => {
                        downloadCallback && downloadCallback(locale, progress);
                    }
                });
            }

            // lấy dữ liệu từ cache
            data = await I18nCache.get(urlDownload);
        } catch (e) { }

        // parse
        if (typeof data === "string") {

            try {
                data = JSON.parse(data);
            } catch (e) {
                data = null;
            }
        }
        if (typeof data !== "object") {
            data = null;
        }

        return data;
    };

    try {
        // tải ngôn ngữ mặc định
        let defaultTranslation = await I18n.loadTranslation(defaultLocale);
        setTranslation(defaultLocale, defaultTranslation || {});
    } catch (error) {}

    let currentLocale = defaultLocale;//DeviceInfo.getDeviceLocale();
    
    try {

        // kiểm tra ngôn ngữ hiện tại
        let hasCurrentLocale = await LangCache.has(syncKey);
        
        // nếu có cache thì lấy cache
        if (hasCurrentLocale) {

            currentLocale = await LangCache.get(hasCurrentLocale);
        }

        if (currentLocale != defaultLocale) {

            currentLocale = await changeLocale(currentLocale);
        }
        if (!hasCurrentLocale) {

            await LangCache.put(syncKey, currentLocale);
        }
    } catch (error) {}

    I18n.locale = currentLocale;

    // sự kiện thay đổi ngôn ngữ
    I18n.configLocale = async (locale) => {

        let change = defaultLocale;
        try {

            change = await changeLocale(locale);
        } catch (error) { }

        try {

            if (change == locale) {

                await LangCache.put(syncKey, locale);
            }
        } catch (error) { }
    };

    I18n.configDefaultLocale = async (locale) => {
        
        try {

            await changeLocale(locale);
        } catch (error) { }
    };

    return currentLocale;
};