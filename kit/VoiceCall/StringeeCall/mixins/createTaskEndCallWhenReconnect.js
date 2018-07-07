import { NetInfo } from 'react-native';
import StringeeClient from '../../StringeeClient';

export default function (type = "hangup", callId) {

    let eventNetwork;
    let stringeeClient = new StringeeClient();
    const callStateCode = type == "reject" ? 3 : 4;

    // hàm huỷ sự kiện
    let successHandle = (status) => {

        eventNetwork
            && eventNetwork.remove
            && eventNetwork.remove()
        ;
        eventNetwork = null;
        if (status) {

            stringeeClient
                && stringeeClient.destroy
                && stringeeClient.destroy()
            ;
            stringeeClient = null;
        }
    };

    // hàm xử lý kết thúc cuộc gọi
    let handle = () => {

        let callInfo = this.getCallInfo();
        if (callInfo) {

            callInfo = {
                ...callInfo,
                callState: callStateCode
            };
            this.setCallInfo(callInfo);
        }

        if (type == "reject") {

             // kết thúc cuộc gọi
            return this._mapping.reject(callId, successHandle);
        }

        // kết thúc cuộc gọi
        return this._mapping.hangup(callId, successHandle);
    };

    // bắt sự kiện kết nối mạng để kết thúc cuộc gọi
    eventNetwork = NetInfo.isConnected.addEventListener("connectionChange", (isConnected) => {

        // nếu có kết nối
        if (isConnected) {

            handle();
        }
    });

    // bắt sự kiện kết nối stringee thành công để kết thúc cuộc gọi
    stringeeClient.addListener("onConnect", handle);

    return {
        cancel: () => {
            successHandle(true);
        }
    };
};