import { NativeModules, Alert, Platform } from 'react-native';
import LoadingTask from '~/library/LoadingTask';
import codePush from "react-native-code-push";

let AlertAdapter = Alert;
if (Platform.OS == "android") {

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
            });
        }
    };
}

export default (taskManager, pipi) => {

    try {
        // task kiểm tra cập nhật
        let taskCheckVersion = new LoadingTask.Task(
            translate("tasks.code_push"),
            async (updatePeriod) => {

                try {
                    
                    updatePeriod && updatePeriod(0, translate("updater.checking_for_update"));
    
                    // cài đặt ngay sau khi download dùng cho package bắt buộc
                    let resolvedInstallMode = codePush.InstallMode.IMMEDIATE;
                    
                    // số giây tối thiểu ứng dụng cần phải chạy nền trước khi khởi động lại
                    let minimumBackgroundDuration = 60 * 5;
    
                    // thông báo cho code push app vẫn còn chạy ))
                    await codePush.notifyAppReady();

                    let currentPackage = await codePush.getCurrentPackage();
                    let remotePackage = await codePush.checkForUpdate();
    
                    // kiểm tra bản mới đã từng cài đặt bị lỗi
                    const updateShouldBeIgnored = remotePackage && remotePackage.failedInstall;
    
                    // nếu không có bản mới hoặc bản mới bị lỗi
                    if (!remotePackage || updateShouldBeIgnored) {
    
                        if (currentPackage) {
                            
                            // nếu là chưa cài đặt
                            if (currentPackage.isPending) {
        
                                // cài đặt sau khi khởi động lại
                                updatePeriod && updatePeriod(1, translate("updater.update_installed"));
                                pipi && pipi(codePush.SyncStatus.UPDATE_INSTALLED);
                                return;
                            }
                            
                            // nếu là lần chạy đầu tiên
                            if (currentPackage.isFirstRun) {
        
                                try {
                                    
                                    updatePeriod && updatePeriod(0.8, translate("updater.clear_cache"));

                                    await CacheManager.clearAll({
                                        whitelist: [
                                            "language"
                                        ]
                                    });
                                } catch (e) {}

                                codePush.restartApp();
                                
                                // cài đặt thành công
                                updatePeriod && updatePeriod(1, translate("updater.update_successfully"));
                                pipi && pipi(codePush.SyncStatus.UPDATE_INSTALLED);
                                return;
                            }
                        }
    
                        // đã là phiên bản mới nhất
                        updatePeriod && updatePeriod(1, translate("updater.up_to_date"));
                        pipi && pipi(codePush.SyncStatus.UP_TO_DATE);
                        return;
                    }
    
                    if (remotePackage) {
    
                        if (
                            remotePackage.failedInstall 
                            && currentPackage 
                            && currentPackage.isFirstRun
                        ) {
    
                            AlertAdapter.alert(
                                translate("updater.update_failed")
                            );
    
                            // cài đặt không thành công
                            updatePeriod && updatePeriod(1, translate("updater.update_failed"));
                            pipi && pipi(codePush.SyncStatus.UNKNOWN_ERROR);
                            return;
                        }
                        
                        if (remotePackage.download && remotePackage.downloadUrl) {
    
                            // xử lý version name
                            let newVersion = `${remotePackage.appVersion}-${remotePackage.label.replace(/\D+/, "")}`;
                            
                            try {
                                
                                await new Promise((resolve, reject) => {
        
                                    // nút nhấn
                                    let buttons = [
                                        {
                                            text: translate("updater.optional_install_buttonLabel"),
                                            onPress: async () => {
        
                                                try {
                                                    
                                                    //console.log(`codePush.SyncStatus.DOWNLOADING_PACKAGE`);
                                                    updatePeriod && updatePeriod(0, translate("updater.downloading", {
                                                        package: "0%"
                                                    }));
            
                                                    // download package
                                                    let localPackage = await remotePackage.download(({
                                                        totalBytes: totalByte = 0,
                                                        receivedBytes: currentByte = 0
                                                    }) => {
            
                                                        let period = totalByte !== 0 ? (currentByte / totalByte): 0;
            
                                                        updatePeriod && updatePeriod(Math.min(period, 0.99), translate("updater.downloading", {
                                                            package: `${period * 100}%`
                                                        }));
                                                    });
            
                                                    // nếu có install
                                                    if (localPackage && localPackage.install) {
            
                                                        //console.log(`codePush.SyncStatus.INSTALLING_UPDATE`);
                                                        updatePeriod && updatePeriod(0.99, translate("updater.installing_update"));
                            
                                                        await localPackage.install(resolvedInstallMode, minimumBackgroundDuration, () => {
            
                                                            updatePeriod && updatePeriod(0.99, translate("updater.update_installed"));
                                                            resolve(codePush.SyncStatus.UPDATE_INSTALLED);
                                                        });

                                                    }
                                                } catch (error) {
                                                    
                                                    //console.log(`codePush.SyncStatus.UNKNOWN_ERROR`);
                                                    updatePeriod && updatePeriod(1, translate("updater.update_failed"));
                                                    reject(codePush.SyncStatus.UNKNOWN_ERROR);
                                                    return pipi && pipi();
                                                }
        
                                            }
                                        }
                                    ];
        
                                    // nếu phiên bản không bắt buộc
                                    if (!remotePackage.isMandatory) {
        
                                        // thêm nút bỏ qua
                                        buttons.push({
                                            text: translate("updater.optional_ignore_button_label"),
                                            onPress: () => {
        
                                                //console.log(`codePush.SyncStatus.UPDATE_IGNORED`);
                                                resolve(codePush.SyncStatus.UPDATE_IGNORED);
                                            }
                                        });
                                    }
        
        
                                    // console.log(`codePush.SyncStatus.AWAITING_USER_ACTION`);
                                    updatePeriod && updatePeriod(0, translate("updater.awaiting_user_action"));
                                    AlertAdapter.alert(
                                        translate("updater.update_available", {
                                            version: newVersion
                                        }),
                                        remotePackage.isMandatory ? translate("updater.mandatory_update_message") : translate("updater.optional_update_message"),
                                        buttons
                                    );
                                });

                                updatePeriod && updatePeriod(1, translate("updater.update_successfully"));
                                return pipi && pipi();

                            } catch (error) {
                                
                                updatePeriod && updatePeriod(1, translate("updater.update_failed"));
                                return pipi && pipi();
                            }
                        }
                    }
                    updatePeriod && updatePeriod(1, translate("updater.up_to_date"));
                    return pipi && pipi();
                } catch (error) {
                    
                    updatePeriod && updatePeriod(1, translate("updater.update_failed"));
                    pipi && pipi();
                }
            },
            translate("tasks.checking_code_push")
        );

        taskManager.addTask(taskCheckVersion);
    } catch (error) {
        pipi && pipi();
    }
};