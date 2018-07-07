import ServiceProvider from '../Support/ServiceProvider';

class CacheManagerService extends ServiceProvider {

    constructor(app) {
        super(app);
        
        if (app.configs("cacheManager")) {

            app.singleton("cacheManager", () => {

                const CacheManager = require("../Cache/CacheManager").default;
                const drivers = app.configs("cacheManager.drivers") || {
                    "Memory": require("../Cache/Adapter/Memory").default,
                    "LocalStore": require("../Cache/Adapter/LocalStore").default
                };
                const caches = app.configs("cacheManager.caches") || {};

                return new CacheManager(caches, drivers);
            });
        }
    }
}

export default CacheManagerService;