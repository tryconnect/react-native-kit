class CacheManager {

    constructor( configs = {}, drivers = {} ) {

        this.configs = configs || {};
        this._resolved = {};
        this._drivers = drivers || {};
    }

    resolve = async ( name ) => {

        if( name ) {
            
            if ( this._resolved.hasOwnProperty(name) ) {

                return this._resolved[name];
            }

            if (
                typeof this.configs[name] !== "object" 
                || !this._drivers.hasOwnProperty(this.configs[name].driver)
            ) {

                throw new Error("cache driver not support");
            }

            return this._resolved[name] = await this.createDriver(
                this.configs[name].driver, 
                this.configs[name].namespace, 
                this.configs[name].options
            );
        }

        return;
    };

    createDriver = async (driver, namespace = "tmp", options = {}) => {

        if (!this._drivers.hasOwnProperty(driver)) {

            throw new Error("cache driver not support");
        }

        let instance = new this._drivers[driver](namespace, options);

        try {
            if (instance.configure) {

                await instance.configure(options);
            }
        } catch (error) {}

        return instance;
    };

    clearAll = (options = {}) => {
        
        const {
            whitelist = []
        } = options || {};
        
        return new Promise( async (res, rej) => {

            let keys = [];
            let errors = [];

            for (let name in this.configs) {

                if(
                    whitelist.includes(name)
                    || this.configs[name].keepClear
                ) {
                    continue;
                }

                if (this.configs.hasOwnProperty(name)) {
                    
                    try {
                        
                        let instance = this.resolve(name);
                        if (instance && instance.clear) {
    
                            await instance.clear();
                            keys.push(name);
                        }
                    } catch (error) {

                        errors.push(error.message);
                    }
                }
            }

            if (errors.length) {

                return rej(errors);
            }

            return res(keys);
        } );
    };
}

export default CacheManager;