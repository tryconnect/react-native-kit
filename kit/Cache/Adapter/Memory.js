import md5 from 'crypto-js/md5';
import mixins from '../mixins';

const DEFAULT_CONFIGS = {};

const Cache = {};

class MemoryCache {

    name = "Memory";

    constructor(namespace = "tmp", configs = {}) {
        mixins.apply(this);

        this.namespace = namespace;
        this.configs = {
            ...DEFAULT_CONFIGS,
            ...configs
        };
        this.path = namespace;

        if (typeof Cache[namespace] !== "object") {

            Cache[namespace] = {};
        }
    }

    getPath(key) {

        if (`${key}`.startsWith(`path://${this.path}:`)) {

            return key;
        }

        key = this.hashKey(key);

        return `path://${this.path}:${key}`;
    }

    hashKey(key) {
        key = `${key}`;

        key = md5(key);
        return `${key}`;
    }

    has(key) {

        return new Promise((resolve, reject) => {
            
            try {

                let path = this.getPath(key);
                key = `${path}`.replace(`path://${this.path}:`, "");

                if (Cache[this.path] && Cache[this.path][key] !== undefined) {

                    return resolve(path);
                }

                resolve(false);
            } catch (error) {

                reject(error);
            }
        });
    }

    get(key) {

        return new Promise((resolve, reject) => {

            try {

                let path = this.getPath(key);
                key = `${path}`.replace(`path://${this.path}:`, "");

                if (typeof Cache[this.path] === "object") {

                    return resolve(Cache[this.path][key]);
                }

                resolve(undefined);
            } catch (error) {

                reject(error);
            }
        });
    }

    keys() {

        return new Promise((resolve, reject) => {

            try {

                let allKeys = [];
                if (typeof Cache[this.path] === "object") {

                    for (let key in Cache[this.path]) {

                        if (Cache[this.path].hasOwnProperty(key)) {

                            allKeys.push(`path://${this.path}:${key}`);
                        }
                    }
                }

                resolve(allKeys);
            } catch (error) {

                reject(error);
            }
        });
    }

    all() {

        return new Promise(async (resolve, reject) => {

            try {

                let allKeys = await this.keys();
                allKeys = allKeys.map((key) => {

                    return this.get(key);
                });

                resolve(allKeys);
            } catch (error) {

                reject(error);
            }
        });
    }

    put(key, data = undefined) {

        return new Promise((resolve, reject) => {

            try {

                let path = this.getPath(key);
                key = `${path}`.replace(`path://${this.path}:`, "");

                if (typeof Cache[this.path] !== "object") {

                    Cache[this.path] = {};
                }

                Cache[this.path][key] = data;

                resolve(path);
            } catch (error) {

                reject(error);
            }
        });
    };

    delete(key) {

        return new Promise((resolve, reject) => {

            try {

                let path = this.getPath(key);
                key = `${path}`.replace(`path://${this.path}:`, "");

                if (typeof Cache[this.path] === "object") {

                    delete Cache[this.path][key];
                    return resolve(path);
                }

                resolve(false);
            } catch (error) {

                reject(error);
            }
        });
    }

    clear() {

        return new Promise((resolve, reject) => {

            try {

                delete Cache[this.path];
                resolve(this.path);

            } catch (error) {

                reject(error);
            }
        });
    }

    async getItem(key, callback) {

        try {
            
            let hasCache = await this.has(key);
            if (!hasCache) {

                callback && callback(null, undefined);
                return undefined;
            }
            let result = await this.get(hasCache);
            callback && callback(null, result);
            return result;
        } catch (error) {
            callback && callback(error);
            throw error;
        }
    }

    async setItem(key, value, callback) {

        try {

            let result = await this.put(key, value);
            callback && callback(null, result);
            return result;
        } catch (error) {
            callback && callback(error);
            throw error;
        }
    }

    async removeItem(key, callback) {

        try {

            let result = await this.delete(key);
            callback && callback(null, result);
            return result;
        } catch (error) {
            callback && callback(error);
            throw error;
        }
    }
}

MemoryCache.name = "Array";
export default MemoryCache;