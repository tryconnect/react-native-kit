import ServiceProvider from '../Support/ServiceProvider';

class CacheManagerService extends ServiceProvider {

    register() {

        if (this.app.configs("cacheManager")) {

            this.app.singleton("cacheManager", () => {
    
                const CacheManager = require("../Cache/CacheManager").default;
                const drivers = this.app.configs("cacheManager.drivers") || {
                    "Memory": require("../Cache/Adapter/Memory").default,
                    "LocalStore": require("../Cache/Adapter/LocalStore").default
                };
                const caches = this.app.configs("cacheManager.caches") || {};
    
                return new CacheManager(caches, drivers);
            });
        }
    }

    boot() {

    }
}

export default CacheManagerService;