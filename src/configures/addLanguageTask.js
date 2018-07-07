import { Platform, PermissionsAndroid } from 'react-native';
import Permissions from 'react-native-permissions';
import LoadingTask from '~/library/LoadingTask';
import configureI18n from '~/configures/configureI18n';

// hàm kiểm tra kết quả thành công hoặc không
const isGranted = (result) => {

    return (
        result === true
        || result === "authorized"
        || result === 'grant'
        || result === 'granted'
        || result === PermissionsAndroid.RESULTS.GRANTED
    );
};

export default async (taskManager, pipi) => {

    try {

        // task kiểm tra phân quyền lưu trữ
        let taskPermisstion = new LoadingTask.Task(
            translate("tasks.permission"),
            async (updatePeriod) => {

                // nếu không phải android thì không cần check
                if (Platform.OS != "android") {

                    return updatePeriod && updatePeriod(1, translate("tasks.permission_done", {
                        permission: "Storage"
                    }));
                }

                let granted;

                // kiểm tra
                granted = await Permissions.check("storage");

                // nếu đã phân quyền
                if (isGranted(granted)) {

                    return updatePeriod && updatePeriod(1, translate("tasks.permission_done", {
                        permission: "Storage"
                    }));
                }

                // yêu cầu cấp quyền
                granted = await Permissions.request("storage", {
                    rationale: translate("permission_rationale.storage")
                });

                // nếu đã cấp
                if (isGranted(granted)) {

                    return updatePeriod && updatePeriod(1, translate("tasks.permission_done", {
                        permission: "Storage"
                    }));
                }

                return updatePeriod && updatePeriod(1, translate("tasks.permission_failed", {
                    permission: "Storage"
                }));
            },
            translate("tasks.checking_permission", {
                permission: "Storage"
            })
        );

        taskManager.addTask(taskPermisstion);

        // task cấu hình ngôn ngữ
        let taskSetupLang = new LoadingTask.Task(
            translate("tasks.language"),
            async (updatePeriod) => {

                try {

                    // đợi kết quả cấu hình
                    await configureI18n({
                        downloadCallback: (locale, progress) => {

                            // trạng thái download
                            let {
                                receivedBytes = 0,
                                totalBytes = 0
                            } = progress || {};
                            receivedBytes = (receivedBytes * 1) || 0;
                            totalBytes = (totalBytes * 1) || 0;

                            // nếu tổng dung lượng = 0 thì cập nhật lại trạng thái 99%
                            if (totalBytes === 0) {

                                return updatePeriod && updatePeriod(0.99, translate("tasks.downloading_language", {
                                    language: translate(`locales.${locale}`)
                                }));
                            }

                            // cập nhật trạng thái download
                            updatePeriod && updatePeriod(Math.min(receivedBytes / totalBytes, 0.999), translate("tasks.downloading_language", {
                                language: translate(`locales.${locale}`)
                            }));
                        }
                    
                    });
                    // cấu hình thành công
                    updatePeriod && updatePeriod(1, translate("tasks.setup_language_done"));
                } catch (error) {

                    // cấu hình không thành công
                    updatePeriod && updatePeriod(1, translate("tasks.setup_language_failed"));
                }

                return pipi && pipi();
            },
            translate("tasks.setting_language")
        );

        taskManager.addTask(taskSetupLang);

    } catch (error) {

        return pipi && pipi();
    }
};