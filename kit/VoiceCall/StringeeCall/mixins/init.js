import { DeviceEventEmitter, NetInfo } from 'react-native';
import checkPermissions from '../../checkPermissions';
import {
    comfirmRequestEventName
} from '../utils/generateCallInfoHandle';
import EventManager from '../../EventManager';
import EventEmitter from 'EventEmitter';
import InCallManager from '../../InCallManager';

// init lại để fix lỗi crash ngang bị dính các event cũ
InCallManager.stop();

export default function() {

    // nhạc đang phát
    this._soundPlaying = null;

    // các hàm xử lý dữ liệu confirm
    this._commands = {};

    // tình trạng mạng
    this._isConnected = true;

    // quản lý event
    this._eventManager = new EventManager(DeviceEventEmitter);

    // event đếm thời gian
    this._clockEmiter = new EventEmitter();
    this._eventClockManager = new EventManager(this._clockEmiter);

    // nếu có tự động check quyền
    if (this.options.autoCheckPermissions) {

        this._taskManager.addTask(checkPermissions(false, false, this.options.permistionRationale, this.options.permissionDeniedCallback));
    }

    // xử lý trạng thái mạng
    const handleNetwork = (isConnected) => {

        this._isConnected = isConnected;
        if (this.getCallInfo()) {

            this.setCallInfo({
                isConnected
            });
        }
    };

    // lấy tình trạng mạng
    NetInfo.isConnected.fetch().then(this._taskManager.addTask(handleNetwork));

    // theo dõi tình trạng mạng
    this._networkEvent = NetInfo.isConnected.addEventListener("connectionChange", handleNetwork);

    // command 
    this.addCommand("__getCallInfo__", () => {

        return this.getCallInfo();
    });

    // listen request command
    this.addListener(comfirmRequestEventName, async (e) => {

        try {

            let data = e.data;
            data = JSON.parse(data);

            // check command đã đăng ký
            let handle = this._commands[data.type];

            // nếu có command handle
            if (handle) {

                let result = handle(data);

                // check nếu là promise thì đợi kết quả
                if (result && result.then) {
                    result = await result;
                }

                if (typeof result !== "string" && result !== undefined) {
                    result = JSON.stringify(result || null);
                }

                // gửi lại kết quả
                this.sendAnswerInfo(
                    e.callId,
                    e.eventId,
                    result
                );
            }
        } catch (error) { }
    });
};