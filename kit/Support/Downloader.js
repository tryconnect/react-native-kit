import RNFetchBlob from 'react-native-fetch-blob';
import MemoryCache from '../Cache/Adapter/Memory';
import { lookup as mimeLookup } from 'react-native-mime-types';
import { Platform } from 'react-native';

const DEFAULT_CONFIGS = {
    fileCache: false,
    method: "GET",
    multipart: undefined,
    cache: new MemoryCache("download")
};

class Downloader {

    constructor(configs = {}) {

        this.configs = {
            ...DEFAULT_CONFIGS,
            ...configs
        };
    }

    getCache() {

        return this.configs.cache;
    };

    setCache(Cache) {

        this.configs.cache = Cache;
    };

    getConfigs() {

        return this.configs;
    };

    download(url, options = {}) {

        const result = new Promise(async (resolve, reject) => {
            await Promise.resolve();

            // cấu hình fetch blob
            options = {
                ...this.configs,
                ...options
            };

            const {
                headers = {},
                progress,
                uploadProgress,
                method = "GET",
                multipart,
                cache,
                ...configs
            } = options;

            var mimeType = mimeLookup(url);
            var base64;

            // kiểm tra cache
            if (cache) {

                // set lại file system
                if (cache.isFile()) {

                    configs.fileCache = true;
                }

                try {
                    const hasCache = await cache.has(url);

                    // nếu có cache thì lấy cache
                    if (hasCache) {

                        mimeType = mimeType || mimeLookup(hasCache);

                        // lấy nội dung
                        const content = await cache.get(hasCache, "base64");
                        base64 = `data:${mimeType};base64,${content}`;
                        return resolve(base64);
                    }
                } catch (e) { }
            }

            // nếu chưa có path và cache là file thì tạo path cho file
            if (
                !configs.path
                && cache
                && cache.isFile()
            ) {

                configs.path = cache.getPath(url);
                configs.path = configs.path.replace(FILE_PREFIX, "");
            }

            // check path download
            configs.path = configs.path || `${(
                RNFetchBlob.fs.dirs.CacheDir
                || RNFetchBlob.fs.dirs.DocumentDir
                || RNFetchBlob.fs.dirs.MainBundleDir
                || RNFetchBlob.fs.dirs.DownloadDir
                || RNFetchBlob.fs.dirs.SDCardDir
            )}/tmp_${(new Date).getTime()}`;

            // hàm progress download
            const progressCallback = (receivedBytes, totalBytes) => {

                if (progress) {

                    receivedBytes = receivedBytes || 0;
                    receivedBytes = receivedBytes * 1;
                    totalBytes = totalBytes || 0;
                    totalBytes = totalBytes * 1;
                    progress({
                        receivedBytes,
                        totalBytes
                    });
                }
            };

            // hàm progress upload
            const uploadProgressCallback = (writtenBytes, totalBytes) => {

                if (uploadProgress) {

                    writtenBytes = writtenBytes || 0;
                    writtenBytes = writtenBytes * 1;
                    totalBytes = totalBytes || 0;
                    totalBytes = totalBytes * 1;
                    uploadProgress({
                        writtenBytes,
                        totalBytes
                    });
                }
            };

            // tác vụ download
            var task = RNFetchBlob
                .config(configs)
                .fetch(method, url, headers, multipart)
                .uploadProgress(uploadProgressCallback)
                .progress(progressCallback)
            ;

            // hàm huỷ down
            result.cancel = (message) => {

                if (task && task.cancel) {
                    task.cancel();
                    task = undefined;
                }
                reject(new Error(message));
            };

            try {

                // chờ down xong
                const res = await task;
                task = undefined;

                // tạo loại file từ ext trong url
                mimeType = mimeType
                    || mimeLookup(res.path())
                    || (
                        res.respInfo.headers["Content-Type"]
                        || res.respInfo.headers["content-Type"]
                        || res.respInfo.headers["content-type"]
                        || res.respInfo.headers["CONTENT-TYPE"]
                        || ""
                    ).split(";")[0]
                    || "text/plain"
                ;
                mimeType = mimeType.toLowerCase();

                // lấy base64
                base64 = await res.base64();

                if (
                    !this.configs.fileCache 
                    && (cache && !cache.isFile())
                ) {

                    // xoá file
                    await res.flush();
                }

                // tạo base64
                base64 = `data:${mimeType};base64,${base64}`;

            } catch (e) {

                return reject(e);
            }

            if (cache && !cache.isFile()) {

                try {

                    // lưu cache
                    await cache.put(url, base64, "base64");
                } catch (e) { }
            }

            resolve(base64);
        });

        result.cancel = () => { };

        return result;
    }
}

const FILE_PREFIX = Platform.OS === "ios" ? "" : "file://";

export default Downloader;