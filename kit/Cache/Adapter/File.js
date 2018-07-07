import { Platform, PermissionsAndroid } from 'react-native';
import RNFS from 'react-native-fs';
import md5 from 'crypto-js/md5';
import mixins from '../mixins';
import throttledPromise from '../../Utilities/throttledPromise';

const DEFAULT_CONFIGS = {
    keepExt: true,
    hashFileName: true,
    baseDir: RNFS.CachesDirectoryPath
        || RNFS.TemporaryDirectoryPath
        || RNFS.ExternalCachesDirectoryPath
        || RNFS.DocumentDirectoryPath
        || RNFS.MainBundlePath
        || RNFS.LibraryDirectoryPath
        || RNFS.ExternalStorageDirectoryPath
        || RNFS.ExternalDirectoryPath,
    timeout: 60000,
    timeoutMessage: "Cache timeout"
};

class FileCache {

    name = "File";

    constructor(namespace = "tmp", configs = {}) {

        mixins.apply(this);
        this.namespace = namespace;
        this.configs = {
            ...DEFAULT_CONFIGS,
            ...configs
        };

        this.path = `${FILE_PREFIX}${this.configs.baseDir}/${namespace}`;
    }

    async checkPermistion() {

        if( Platform.OS != "android" ) {

            return "GRANTED";
        }

        let readGranted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
            this.configs.readRationale
        );

        let writeGranted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
            this.configs.writeRationale
        );

        if (
            (
                readGranted === true
                || readGranted === PermissionsAndroid.RESULTS.GRANTED
            ) && (
                writeGranted === true
                || writeGranted === PermissionsAndroid.RESULTS.GRANTED
            )
        ) {

            return "GRANTED";
        }

        return "DENIED";
    }

    async configure(options = {}) {

        this.configs = {
            ...this.configs,
            ...options
        };

        let path = `${this.path}`.replace(FILE_PREFIX, "");

        let granted = await this.checkPermistion();
        if (granted !== "GRANTED") {

            throw new Error('Permistion denined');
        }
        const exists = await throttledPromise(
            RNFS.exists, 
            this.configs.timeout,
            this.configs.timeoutMessage
        )(path);
        if (!exists) {

            await throttledPromise(
                RNFS.mkdir,
                this.configs.timeout,
                this.configs.timeoutMessage
            )(path, MkdirOptions);
        }
    }

    getPath(key) {

        if (`${key}`.startsWith(`${this.path}`)) {

            return key;
        }

        key = this.hashKey(key);

        return `${this.path}/${key}`;
    }

    hashKey(key) {
        key = `${key}`;

        let isParams = key.includes("?");
        let isHash = key.includes("#");
        let isDir = key.includes("/");
        let fileName = key;
        let ext = "";

        if (fileName.includes(".")) {

            ext = fileName.substring(
                fileName.lastIndexOf("."),
                isParams ? fileName.indexOf("?") : (isHash ? fileName.indexOf("#") : undefined)
            );
        }

        if (isParams || isHash || isDir || this.configs.hashFileName) {

            fileName = md5(key);
            fileName = `${fileName}`;

            if (this.configs.keepExt) {

                fileName = `${fileName}${ext}`;
            }
        }

        return fileName;
    }

    has(key) {

        return new Promise(async (resolve, reject) => {

            try {

                let path = this.getPath(key);
                let granted = await this.checkPermistion();
                if (granted !== "GRANTED") {

                    throw new Error('Permistion denined');
                }
                const exists = await throttledPromise(
                    RNFS.exists, 
                    this.configs.timeout,
                    this.configs.timeoutMessage
                )(path.replace(FILE_PREFIX, ""));

                if (exists) {
                    return resolve(path);
                }

                resolve(false);
            } catch (error) {

                reject(error);
            }
        });
    }

    get (key, encoding = "utf8") {

        encoding = encoding || "utf8";

        return new Promise(async (resolve, reject) => {

            try {

                let path = this.getPath(key);
                let granted = await this.checkPermistion();
                if (granted !== "GRANTED") {

                    throw new Error('Permistion denined');
                }

                const exists = await throttledPromise(
                    RNFS.exists, 
                    this.configs.timeout,
                    this.configs.timeoutMessage
                )(path.replace(FILE_PREFIX, ""));
                if (exists) {

                    const file = await throttledPromise(
                        RNFS.readFile, 
                        this.configs.timeout,
                        this.configs.timeoutMessage
                    )(path.replace(FILE_PREFIX, ""), encoding);
                    resolve(file);
                }

                return reject(new Error("File not found"));

            } catch (error) {

                reject(error);
            }
        });
    }

    keys() {

        return new Promise(async (resolve, reject) => {

            try {

                let path = `${this.path}`.replace(FILE_PREFIX, "");
                const exists = await throttledPromise(
                    RNFS.exists, 
                    this.configs.timeout,
                    this.configs.timeoutMessage
                )(path);
                if (!exists) {

                    return resolve([]);
                }

                let allPaths = await throttledPromise(
                    RNFS.readDir, 
                    this.configs.timeout,
                    this.configs.timeoutMessage
                )(path);
                allPaths = allPaths || [];
                allPaths = allPaths.map(f => {

                    if (f && f.isFile && f.isFile()) {

                        return f.path;
                    }
                });

                allPaths = allPaths.filter((path) => {

                    return !!path;
                });

                resolve(allPaths);
            } catch (error) {

                reject(error);
            }
        });
    }

    all(encoding = "utf8") {

        return new Promise(async (resolve, reject) => {

            try {

                let allKeys = await this.keys();
                allKeys = allKeys.map((key) => {

                    return this.get(key, encoding);
                });

                resolve(allKeys);
            } catch (error) {

                reject(error);
            }
        });
    }

    put(key, data = undefined, encoding) {

        encoding = encoding || "utf8";

        return new Promise(async (resolve, reject) => {

            try {

                if (data === undefined) {

                    return reject(new Error("Data not available"));
                }

                if (encoding == "base64") {

                    data = data.replace(/^data\:[a-zA-Z0-9\-\_\/]+;base64\,/, "");
                }

                let path = this.getPath(key);
                let realPath = path.replace(FILE_PREFIX, "");

                let granted = await this.checkPermistion();
                if (granted !== "GRANTED") {

                    throw new Error('Permistion denined');
                }

                res = await throttledPromise(
                    RNFS.writeFile, 
                    this.configs.timeout,
                    this.configs.timeoutMessage
                )(realPath, data, encoding);

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
                let granted = await this.checkPermistion();
                if (granted !== "GRANTED") {

                    throw new Error('Permistion denined');
                }
                await throttledPromise(
                    RNFS.unlink, 
                    this.configs.timeout,
                    this.configs.timeoutMessage
                )(path.replace(FILE_PREFIX, ""));

                resolve(path);
            } catch (error) {

                reject(error);
            }
        });
    }

    clear() {

        return new Promise(async (resolve, reject) => {

            try {

                let granted = await this.checkPermistion();
                if (granted !== "GRANTED") {

                    throw new Error('Permistion denined');
                }
                
                await throttledPromise(
                    RNFS.unlink, 
                    this.configs.timeout,
                    this.configs.timeoutMessage
                )(`${this.path}`.replace(FILE_PREFIX, ""));

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
            let result = await this.get(hasCache, "utf8");
            callback && callback(null, result);
            return result;
        } catch (error) {
            callback && callback(error);
            throw error;
        }
    }

    async setItem(key, value, callback) {

        try {

            let result = await this.put(key, value, "utf8");
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

const MkdirOptions = {
    NSURLIsExcludedFromBackupKey: false
};

const FILE_PREFIX = Platform.OS === "ios" ? "" : "file://";

FileCache.name = "File";

export default FileCache;