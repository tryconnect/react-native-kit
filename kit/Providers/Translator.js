import ServiceProvider from '../Support/ServiceProvider';

class TranslatorServiceProvider extends ServiceProvider {

    register() {

        const configs = this.app.configs('translator');
        if (configs) {

            const translator = require("../Foundation/I18n").default;
            const {
                locale = "en",
                defaultLocale = "en",
                fallbacks = false,
                no,
                missingBehaviour,
                missingTranslationPrefix,
                missingTranslation,
                translations
            } = configs;

            // default
            translator.missingBehaviour = missingBehaviour || translator.missingBehaviour;
            translator.missingTranslationPrefix = missingTranslationPrefix || translator.missingTranslationPrefix;
            translator.missingTranslation = missingTranslation || translator.missingTranslation;

            // init
            translator.locale = locale;
            translator.defaultLocale = defaultLocale;

            if(typeof fallbacks === "function") {
                
                translator.fallbacks = true;
                translator.no = fallbacks;
            }
            translator.no = no || translator.no;

            this.app.bind("translator", () => translator);
            this.app.alias("translate", (scope, options = {}) => {

                return translator.translate(scope, options);
            });

            // init translations
            if (typeof translations === "object") {

                for (let key in translations) {
                    if (translations.hasOwnProperty(key)) {
                        let translation = translations[key];
                        if (translation && typeof translation === "object") {

                            translator.setTranslation(key, translation);
                        }
                    }
                }
            }
        }
    }

    boot() {

        const translator = app("translator");
        
        const handleChangeLocale = (locale) => {

            // nếu có dữ liệu
            if (
                translator.getTranslation(locale)
                || translator.getTranslation(translator.defaultLocale)
            ) {

                // reload lại app
                this.app.reload();
            }
        };

        translator.onChangeLocale(handleChangeLocale);
        translator.onChangeDefaultLocale(handleChangeLocale);
        translator.onChangeTranslation(({ locale }) => {

            if (
                locale == translator.locale
                || locale == translator.defaultLocale
            ) {
                this.app.reload();
            }
        });
    }
}

export default TranslatorServiceProvider;