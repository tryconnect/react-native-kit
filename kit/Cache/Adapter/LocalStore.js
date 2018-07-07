import md5 from 'crypto-js/md5';
import { AsyncStorage } from 'react-native';
import mixins from '../mixins';
import throttledPromise from '../../Utilities/throttledPromise';

const DEFAULT_CONFIGS = {
    timeout: 30000,
    timeoutMessage: "Cache timeout"
};

class LocalStoreCache {

    name = "LocalStore";
    constructor(namespace = "tmp", configs = {}) {

        mixins.apply(this);
        this.namespace = namespace;
        this.configs = {
            ...DEFAULT_CONFIGS,
            ...configs
        };
        this.path = `@${namespace}:`;
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

        return new Promise( async (resolve, reject) => {

            try {

                let allKeys = await throttledPromise(
                    AsyncStorage.getAllKeys, 
                    this.configs.timeout,
                    this.configs.timeoutMessage
                )();
                allKeys = allKeys || [];

                let path = this.getPath(key);
                key = `${path}`.replace(`path://`, "");

                if (allKeys.length && allKeys.includes(key)) {

                    return resolve(path);
                }

                resolve(false);
            } catch (error) {

                reject(error);
            }
        });
    }

    get(key) {

        return new Promise(async (resolve, reject) => {

            try {

                let path = this.getPath(key);
                key = `${path}`.replace(`path://`, "");

                let value = await throttledPromise(
                    AsyncStorage.getItem,
                    this.configs.timeout,
                    this.configs.timeoutMessage
                )(key);
                value = value ? JSON.parse(value) : value;

                resolve(value);
            } catch (error) {

                reject(error);
            }
        });
    }

    keys() {

        return new Promise(async (resolve, reject) => {

            try {

                let allKeys = await throttledPromise(
                    AsyncStorage.getAllKeys,
                    this.configs.timeout,
                    this.configs.timeoutMessage
                )();
                allKeys = allKeys || [];

                allKeys = allKeys.filter((key) => {

                    return `${key}`.startsWith(this.path);
                });

                allKeys = allKeys.map((key) => {

                    return `path://${key}`;
                });

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

        return new Promise(async (resolve, reject) => {

            try {

                if (data === undefined) {

                    return reject(new Error("Data not available"));
                }

                let path = this.getPath(key);
                key = `${path}`.replace(`path://`, "");

                data = JSON.stringify(data);
                await throttledPromise(
                    AsyncStorage.setItem,
                    this.configs.timeout,
                    this.configs.timeoutMessage
                )(key, data);

                resolve(path);
            } catch (error) {

                reject(error);
            }
        });
    }

    delete(key) {

        return new Promise(async (resolve, reject) => {

            try {

                let path = this.getPath(key);
                key = `${path}`.replace(`path://`, "");

                await throttledPromise(
                    AsyncStorage.removeItem,
                    this.configs.timeout,
                    this.configs.timeoutMessage
                )(key);

                resolve(path);
            } catch (error) {

                reject(error);
            }
        });
    }

    clear() {

        return new Promise(async (resolve, reject) => {

            try {

                let allPaths = await this.keys();
                allPaths = allPaths || [];
                if (allPaths.length) {
                    
                    let allKeys = allPaths.map((path) => {

                        return `${path}`.replace(`path://`, "");
                    });
                    await throttledPromise(
                        AsyncStorage.multiRemove,
                        this.configs.timeout,
                        this.configs.timeoutMessage
                    )(allKeys);
                }

                resolve(allPaths);
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
            console.log(error);
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

LocalStoreCache.name = "LocalStore";
export default LocalStoreCache;