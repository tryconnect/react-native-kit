import { NativeModules, Alert, Platform } from 'react-native';
import ServiceProvider from '../Support/ServiceProvider';

class CodePushService extends ServiceProvider {

    async register() {

        const codePush = require("react-native-code-push");
        await new Promise((resolve, reject) => {
            
            this.app.getBootProgess().createStep("CodePush", async (updatePeriod) => {
                
                const configs = this.app.configs("codePush") || {};
                const {
                    
                    // cài đặt ngay sau khi download dùng cho package bắt buộc
                    resolvedInstallMode = codePush.InstallMode.IMMEDIATE,

                    // số giây tối thiểu ứng dụng cần phải chạy nền trước khi khởi động lại
                    minimumBackgroundDuration = 60 * 5,

                    // hàm callback khi khởi động lần đầu
                    firstRunCallback,

                    // cho phép xoá cache
                    clearCache,
                    
                    // danh sách cache bỏ qua khi xoá
                    cacheWhitelist = [],
                    
                    // hàm tạo message thông báo
                    generateMessage,

                    // key
                    deploymentKey = null,

                    binaryVersionMismatchCallback
                } = configs;

                // cập nhật trạng thái step
                updatePeriod(0, {
                    description: "checking_for_update",
                    state: codePush.SyncStatus.CHECKING_FOR_UPDATE,
                    resolvedInstallMode,
                    minimumBackgroundDuration
                });

                // lấy package hiện tại
                let currentPackage = await codePush.getCurrentPackage();
                // lấy package trên server
                let remotePackage = await codePush.checkForUpdate(deploymentKey, (remotePackage) => {

                    console.log(remotePackage);
                    binaryVersionMismatchCallback && binaryVersionMismatchCallback(remotePackage);
                });

                // kiểm tra bản mới đã từng cài đặt bị lỗi
                const updateShouldBeIgnored = remotePackage && remotePackage.failedInstall;

                // nếu không có bản mới hoặc bản mới bị lỗi
                if (!remotePackage || updateShouldBeIgnored) {

                    if (currentPackage) {

                        // nếu là chưa cài đặt
                        if (currentPackage.isPending) {

                            // cài đặt sau khi khởi động lại
                            updatePeriod(1, {
                                description: "update_installed",
                                state: codePush.SyncStatus.UPDATE_INSTALLED,
                                isPending: currentPackage.isPending,
                                isFirstRun: currentPackage.isFirstRun,
                                currentPackage,
                                remotePackage,
                                updateShouldBeIgnored,
                                resolvedInstallMode,
                                minimumBackgroundDuration
                            });
                            resolve(codePush.SyncStatus.UPDATE_INSTALLED);
                            return;
                        }

                        // nếu là lần chạy đầu tiên
                        if (currentPackage.isFirstRun) {

                            try {

                                // callback first run
                                firstRunCallback && firstRunCallback(codePush.SyncStatus.UPDATE_INSTALLED);

                                if (clearCache) {

                                    const cacheManager = app("cacheManager");
                                    if (cacheManager) {

                                        updatePeriod(0.8, {
                                            description: "clear_cache",
                                            state: codePush.SyncStatus.UPDATE_INSTALLED,
                                            isPending: currentPackage.isPending,
                                            isFirstRun: currentPackage.isFirstRun,
                                            currentPackage,
                                            remotePackage,
                                            updateShouldBeIgnored,
                                            resolvedInstallMode,
                                            minimumBackgroundDuration
                                        });
    
                                        await cacheManager.clearAll({
                                            whitelist: cacheWhitelist
                                        });
                                    } else {

                                        this.app.booted(() => {

                                            if (app("cacheManager")) {
                                                app("cacheManager").clearAll({
                                                    whitelist: cacheWhitelist
                                                });
                                            }
                                        });
                                    }
                                }
                            } catch (e) {}

                            // cài đặt thành công
                            updatePeriod(1, {
                                description: "update_successfully",
                                state: codePush.SyncStatus.UPDATE_INSTALLED,
                                isPending: currentPackage.isPending,
                                isFirstRun: currentPackage.isFirstRun,
                                currentPackage,
                                remotePackage,
                                updateShouldBeIgnored,
                                resolvedInstallMode,
                                minimumBackgroundDuration
                            });
                            resolve(codePush.SyncStatus.UPDATE_INSTALLED);

                            if (this.app.restart) {

                                this.app.restart();
                            } else {

                                codePush.restartApp();
                            }
                            return;
                        }
                    }

                    // đã là phiên bản mới nhất
                    updatePeriod(1, {
                        description: "up_to_date",
                        state: codePush.SyncStatus.UP_TO_DATE,
                        isPending: currentPackage.isPending,
                        isFirstRun: currentPackage.isFirstRun,
                        currentPackage,
                        remotePackage,
                        updateShouldBeIgnored,
                        resolvedInstallMode,
                        minimumBackgroundDuration
                    });
                    console.log(this);
                    
                    resolve(codePush.SyncStatus.UP_TO_DATE);
                    return;
                }

                // nếu có bản cập nhật
                if (remotePackage) {

                    if (
                        remotePackage.failedInstall
                        && currentPackage
                        && currentPackage.isFirstRun
                    ) {

                        // callback first run
                        firstRunCallback && firstRunCallback(codePush.SyncStatus.UNKNOWN_ERROR);

                        // cài đặt không thành công
                        updatePeriod(1, {
                            description: "update_failed",
                            state: codePush.SyncStatus.UNKNOWN_ERROR,
                            isPending: currentPackage.isPending,
                            isFirstRun: currentPackage.isFirstRun,
                            currentPackage,
                            remotePackage,
                            updateShouldBeIgnored,
                            resolvedInstallMode,
                            minimumBackgroundDuration
                        });
                        resolve(codePush.SyncStatus.UNKNOWN_ERROR);
                        return;
                    }

                    // nếu có download url
                    if (remotePackage.download && remotePackage.downloadUrl) {

                        // xử lý version name
                        let newVersion = `${remotePackage.appVersion}-${remotePackage.label.replace(/\D+/, "")}`;

                        const {
                            optional_update_title,
                            mandatory_update_title,
                            title = `New version: ${newVersion}`,
                            mandatory_update_message,
                            optional_update_message,
                            message = remotePackage.description,
                            optional_ignore_button_label,
                            optional_install_button_label,
                            ignore_label = "ignore",
                            install_label = "install"
                        } = generateMessage(newVersion, {
                            remotePackage,
                            currentPackage
                        });
                        try {

                            await new Promise((res, rej) => {

                                // nút nhấn
                                let buttons = [
                                    {
                                        text: optional_install_button_label || install_label || "install",
                                        onPress: async () => {

                                            try {

                                                updatePeriod(0, {
                                                    package: "0%",
                                                    description: "downloading",
                                                    state: codePush.SyncStatus.DOWNLOADING_PACKAGE,
                                                    isPending: currentPackage.isPending,
                                                    isFirstRun: currentPackage.isFirstRun,
                                                    currentPackage,
                                                    remotePackage,
                                                    updateShouldBeIgnored,
                                                    resolvedInstallMode,
                                                    minimumBackgroundDuration
                                                });

                                                // download package
                                                let localPackage = await remotePackage.download(({
                                                    totalBytes: totalByte = 0,
                                                    receivedBytes: currentByte = 0
                                                }) => {

                                                    let period = totalByte !== 0 ? (currentByte / totalByte) : 0;

                                                    updatePeriod(Math.min(period, 0.99), {
                                                        package: `${period * 100}%`,
                                                        totalBytes: totalByte,
                                                        receivedBytes: currentByte,
                                                        description: "downloading",
                                                        state: codePush.SyncStatus.DOWNLOADING_PACKAGE,
                                                        isPending: currentPackage.isPending,
                                                        isFirstRun: currentPackage.isFirstRun,
                                                        currentPackage,
                                                        remotePackage,
                                                        updateShouldBeIgnored,
                                                        resolvedInstallMode,
                                                        minimumBackgroundDuration
                                                    });
                                                });

                                                // nếu có install
                                                if (localPackage && localPackage.install) {

                                                    updatePeriod(0.99, {
                                                        description: "installing_update",
                                                        state: codePush.SyncStatus.INSTALLING_UPDATE,
                                                        isPending: currentPackage.isPending,
                                                        isFirstRun: currentPackage.isFirstRun,
                                                        currentPackage,
                                                        remotePackage,
                                                        updateShouldBeIgnored,
                                                        resolvedInstallMode,
                                                        minimumBackgroundDuration
                                                    });

                                                    await localPackage.install(resolvedInstallMode, minimumBackgroundDuration, () => {

                                                        updatePeriod(0.99, {
                                                            description: "update_installed",
                                                            state: codePush.SyncStatus.UPDATE_INSTALLED,
                                                            isPending: currentPackage.isPending,
                                                            isFirstRun: currentPackage.isFirstRun,
                                                            currentPackage,
                                                            remotePackage,
                                                            updateShouldBeIgnored,
                                                            resolvedInstallMode,
                                                            minimumBackgroundDuration
                                                        });
                                                        res(codePush.SyncStatus.UPDATE_INSTALLED);
                                                    });
                                                }
                                            } catch (error) {

                                                updatePeriod(1, {
                                                    description: "update_failed",
                                                    state: codePush.SyncStatus.UNKNOWN_ERROR,
                                                    isPending: currentPackage.isPending,
                                                    isFirstRun: currentPackage.isFirstRun,
                                                    currentPackage,
                                                    remotePackage,
                                                    updateShouldBeIgnored,
                                                    resolvedInstallMode,
                                                    minimumBackgroundDuration
                                                });
                                                error.code = codePush.SyncStatus.UNKNOWN_ERROR;
                                                rej(error);
                                                return;
                                            }
                                        }
                                    }
                                ];

                                // nếu phiên bản không bắt buộc
                                if (!remotePackage.isMandatory) {

                                    // thêm nút bỏ qua
                                    buttons.push({
                                        text: optional_ignore_button_label || ignore_label || "ignore",
                                        onPress: () => {

                                            updatePeriod(1, {
                                                description: "update_ignored",
                                                state: codePush.SyncStatus.UPDATE_IGNORED,
                                                isPending: currentPackage.isPending,
                                                isFirstRun: currentPackage.isFirstRun,
                                                currentPackage,
                                                remotePackage,
                                                updateShouldBeIgnored,
                                                resolvedInstallMode,
                                                minimumBackgroundDuration
                                            });
                                            res(codePush.SyncStatus.UPDATE_IGNORED);
                                        }
                                    });
                                }

                                updatePeriod(0.1, {
                                    description: "awaiting_user_action",
                                    state: codePush.SyncStatus.AWAITING_USER_ACTION,
                                    isPending: currentPackage.isPending,
                                    isFirstRun: currentPackage.isFirstRun,
                                    currentPackage,
                                    remotePackage,
                                    updateShouldBeIgnored,
                                    resolvedInstallMode,
                                    minimumBackgroundDuration
                                });
                                
                                // thông báo
                                AlertAdapter.alert(
                                    (
                                        remotePackage.isMandatory ? 
                                            mandatory_update_title 
                                        : optional_update_title
                                    ) || title || `New version: ${newVersion}`,
                                    (
                                        remotePackage.isMandatory ?
                                            mandatory_update_message
                                            : optional_update_message
                                    ) || message || remotePackage.description
                                );
                            });

                            updatePeriod(1, {
                                description: "update_successfully",
                                state: codePush.SyncStatus.UPDATE_INSTALLED,
                                isPending: currentPackage.isPending,
                                isFirstRun: currentPackage.isFirstRun,
                                currentPackage,
                                remotePackage,
                                updateShouldBeIgnored,
                                resolvedInstallMode,
                                minimumBackgroundDuration
                            });
                            resolve(codePush.SyncStatus.UPDATE_INSTALLED);
                            return;

                        } catch (error) {

                            updatePeriod(1, {
                                description: "update_failed",
                                state: codePush.SyncStatus.UNKNOWN_ERROR,
                                isPending: currentPackage.isPending,
                                isFirstRun: currentPackage.isFirstRun,
                                currentPackage,
                                remotePackage,
                                updateShouldBeIgnored,
                                resolvedInstallMode,
                                minimumBackgroundDuration
                            });
                            reject(codePush.SyncStatus.UNKNOWN_ERROR);
                            return;
                        }
                    }
                }

                updatePeriod(1, {
                    description: "up_to_date",
                    state: codePush.SyncStatus.UP_TO_DATE,
                    isPending: currentPackage.isPending,
                    isFirstRun: currentPackage.isFirstRun,
                    currentPackage,
                    remotePackage,
                    updateShouldBeIgnored,
                    resolvedInstallMode,
                    minimumBackgroundDuration
                });
                resolve(codePush.SyncStatus.UP_TO_DATE);
            }, {
                description: "init",
                state: codePush.SyncStatus.CHECKING_FOR_UPDATE
            });
        });

        console.log('register code push');
    }

    async boot() {

        const codePush = require("react-native-code-push");

        // thông báo cho code push app vẫn còn chạy ))
        await codePush.notifyAppReady();
    }
}

let AlertAdapter = Alert;
if (Platform.OS == "android" && NativeModules.CodePushDialog) {

    AlertAdapter = {
        alert(title, message, buttons) {

            if (buttons.length > 2) {

                throw "Can only show 2 buttons for Android dialog.";
            }

            const button1Text = buttons[0] ? buttons[0].text : null,
                button2Text = buttons[1] ? buttons[1].text : null;

            NativeModules.CodePushDialog.showDialog(
                title, message, button1Text, button2Text,
                (buttonId) => {
                    buttons[buttonId].onPress && buttons[buttonId].onPress();
                },
                (error) => {
                    throw error;
                }
            );
        }
    };
}

export default CodePushService;