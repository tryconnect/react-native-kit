import md5 from 'crypto-js/md5';
import { AsyncStorage } from 'react-native';
import mixins from '../mixins';

const DEFAULT_CONFIGS = {};

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

                let allKeys = await AsyncStorage.getAllKeys();
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

                let value = await AsyncStorage.getItem(key);
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

                let allKeys = await AsyncStorage.getAllKeys();
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
                await AsyncStorage.setItem(key, data);

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

                await AsyncStorage.removeItem(key);

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
                    await AsyncStorage.multiRemove(allKeys);
                }

                resolve(allPaths);
            } catch (error) {
                reject(error);
            }
        });
    }
}

LocalStoreCache.name = "LocalStore";
export default LocalStoreCache;