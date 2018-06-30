import I18n from 'i18n-js';

var currentLocale = "en";
var defaultLocale = "en";
var init = false;

export const EVENTS = {
    CHANGE_LOCALE: "change.locale",
    CHANGE_DEFAULT_LOCALE: "change.default-locale",
    CHANGE_TRANSLATION: "change.translation"
};

I18n.EVENTS = EVENTS;

/**
 * @todo observe locale
 * @author Croco
 */
Object.defineProperty(I18n, 'locale', {
    // Using shorthand method names (ES2015 feature).
    get() {

        return currentLocale;
    },
    set(locale) {

        if (currentLocale !== locale || !init) {

            currentLocale = locale;
            // trigger
            app("events").emit(`i18n.${I18n.EVENTS.CHANGE_LOCALE}`, locale);
        }
        init = true;
    },
    enumerable: true,
    configurable: true
});

/**
 * @todo observe defaultLocale
 * @author Croco
 */
Object.defineProperty(I18n, 'defaultLocale', {
    // Using shorthand method names (ES2015 feature).
    get() {
        return defaultLocale;
    },
    set(locale) {

        if (defaultLocale !== locale || !init) {

            defaultLocale = locale;
            // trigger
            app("events").emit(`i18n.${I18n.EVENTS.CHANGE_DEFAULT_LOCALE}`, locale);
        }
        init = true;
    },
    enumerable: true,
    configurable: true
});

// hàm lấy dữ liệu translation
I18n.getTranslation = (locale) => {

    return I18n.translations[locale];
};

// hàm gán dữ liệu translation
I18n.setTranslation = (locale, translation) => {

    if (I18n.translations[locale] !== translation) {

        I18n.translations[locale] = translation;
        app("events").emit(`i18n.${I18n.EVENTS.CHANGE_TRANSLATION}`, { locale, translation });
    }
    return translation;
};

// hàm thêm sự kiện
I18n.addListener = (eventName, handle) => {

    if (!Object.values(I18n.EVENTS).includes(eventName)) {

        throw new Error("event is not support");
    }

    return app("events").addListener(`i18n.${eventName}`, handle);
};

// xoá tất cả sự kiện
I18n.removeAllListeners = () => {

    for (let key in I18n.EVENTS) {
        if (I18n.EVENTS.hasOwnProperty(key)) {
            let eventName = `i18n.${I18n.EVENTS[key]}`;
            app("events").removeAllListeners(eventName);
        }
    }
};

// hàm add sự kiện thay đổi ngôn ngữ hiện tại
I18n.onChangeLocale = (handle) => {

    return I18n.addListener(I18n.EVENTS.CHANGE_LOCALE, handle);
};

// hàm add sự kiện thay đổi ngôn ngữ mặc định
I18n.onChangeDefaultLocale = (handle) => {

    return I18n.addListener(I18n.EVENTS.CHANGE_DEFAULT_LOCALE, handle);
};

// hàm add sự kiện thay đổi dữ liệu ngôn ngữ
I18n.onChangeTranslation = (handle) => {

    return I18n.addListener(I18n.EVENTS.CHANGE_TRANSLATION, handle);
};

export default I18n;