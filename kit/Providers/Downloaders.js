import ServiceProvider from '../Support/ServiceProvider';

class DownloadersServiceProvider extends ServiceProvider {

    async register() {

        const configs = this.app.configs("downloaders");
        if (configs && Object.keys(configs).length) {

            const cacheManager = app("cacheManager");

            for (let key in configs) {
                if (configs.hasOwnProperty(key)) {
                    let config = configs[key];
                    let cache = null;
                    
                    if (cacheManager && config["cache"]) {
                        
                        cache = await cacheManager.resolve(config["cache"]);
                    }
                    config["cache"] = cache;
                    ((key, config) => {

                        this.app.bind(`downloader.${key}`, () => {
    
                            const Downloader = require("../Support/Downloader").default;
                            return new Downloader(config);
                        });
                    })(key, config);
                }
            }
        }
    }

    async boot() {

    }
}

export default DownloadersServiceProvider;