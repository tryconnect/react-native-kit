import ServiceProvider from '../Support/ServiceProvider';

class DownloadTranslationServiceProvider extends ServiceProvider {

    async register() {

        const translator = app("translator");
        const configs = app().configs("translator");
        if (translator && configs) {

            const {
                // translations,
                defaultLocale,
                locale,
                downloader: downloaderName
            } = configs;

            const downloader = app(`downloader.${downloaderName}`);

            if (downloader) {

                // hàm thay đổi dữ liệu ngôn ngữ
                changeTranslation = async (locale, progress) => {

                    const translations = app().configs("translator.translations");
                    if (
                        typeof translations === "object"
                        && !translator.getTranslation(locale)
                    ) {

                        let url = translations[locale];
                        if (typeof url === "string" && /https?:\/\//.test(url)) {
                            
                            const translation = await this._downloadTranslation(downloader, url, progress);

                            if (translation && typeof translation === "object") {

                                translator.setTranslation(locale, translation);
                                return translation;
                            }
                        }
                    }
                };

                // bắt sự kiện thay đổi ngôn ngữ, download ngôn ngữ nếu chưa tồn tại
                translator.onChangeLocale(changeTranslation);
                translator.onChangeDefaultLocale(changeTranslation);

                // hàm download
                translator.download = async (locale, progress) => {

                    if( typeof locale !== "string" ) {

                        return await Promise.reject("locale url error");
                    }

                    if (!/https?:\/\//.test(locale)) {

                        return await changeTranslation(locale, progress);
                    }

                    const translations = app().configs("translator.translations");
                    if ( typeof translations === "object" ) { 

                        let url = translations[locale];
                        if (/https?:\/\//.test(url)) {

                            const translation = await this._downloadTranslation(downloader, url, progress);

                            if (translation && typeof translation === "object") {

                                translator.setTranslation(locale, translation);
                                return translation;
                            }

                            return await Promise.reject("translation error");
                        }
                    }

                    return await Promise.reject("locale url error");
                };

                
                // nếu dữ liệu ngôn ngữ mặc định không tồn tại
                // tiến hành download init
                if (
                    !translator.getTranslation(defaultLocale)
                    && !translator.getTranslation(locale)
                ) {
                    
                    await new Promise((resolve, reject) => {

                        this.app.getBootProgess().createStep("download.translation", async (updatePeriod) => {
                            
                            try {
                                
                                await translator.download(defaultLocale, ({ receivedBytes, totalBytes }) => {
                                    
                                    receivedBytes = (receivedBytes * 1 || 0);
                                    totalBytes = (totalBytes * 1 || 0);
                                    
                                    if (totalBytes > 0) {

                                        return updatePeriod(Math.min(receivedBytes/ totalBytes, 0.99), {
                                            receivedBytes,
                                            totalBytes,
                                            locale: defaultLocale,
                                            description: "downloading"
                                        });
                                    }
                                    
                                    updatePeriod(0.999, {
                                        receivedBytes,
                                        totalBytes,
                                        locale: defaultLocale,
                                        description: "downloading"
                                    });
                                });
                                resolve();
                            } catch (error) {

                                reject(error);
                                return updatePeriod(1, {
                                    locale: defaultLocale,
                                    description: "downloadded",
                                    error
                                });
                            }

                            updatePeriod(1, {
                                locale: defaultLocale,
                                description: "downloadded"
                            });
                        }, {
                            locale: defaultLocale,
                            description: "init"
                        });
                    });
                }
            }
        }
    }

    async boot() {

    }

    /**
     * @todo Hàm download ngôn ngữ
     * @param {string} locale 
     */
    async _downloadTranslation(downloader, url, progress) {
        
        // download ngôn ngữ
        let translation = await downloader.download(url, progress ? {
            progress
        } : undefined);

        // replace bỏ type trong base64
        translation = translation.replace(/^data\:[a-zA-Z\/0-9]+\;base64\,/, "");

        const RNFetchBlob = require("react-native-fetch-blob").default;
        translation = JSON.parse(RNFetchBlob.base64.decode(translation));
        return translation;
    }
}

export default DownloadTranslationServiceProvider;