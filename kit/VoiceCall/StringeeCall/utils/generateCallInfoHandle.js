// thông số nhận biết event request comfirm
export const comfirmRequestEventName = "onRequestComfirmInfo";
export const comfirmAnswerEventName = "onAnswerComfirmInfo";
export const comfirmAnswerType = "sendAnswerInfo";
export const comfirmRequestType = "sendComfirmInfo";
export const comfirmEventID = "__comfirm_event_id__";
export const comfirmEventType = "__comfirm_event_type__";

/**
 * @todo hàm hỗ trợ tạo event handle sự kiện onReceiveCallInfo
 * @param string eventname
 * @param function handle
 * @return function
 */
export const generateCallInfoHandle = (eventName, handle) => {

    // handle
    return (e) => {
        try {

            // lấy data từ event
            let data = e.data;
            data = JSON.parse(data);
            let eventID = data[comfirmEventID];

            // nếu có event id
            if (eventID) {

                // huỷ dữ liệu tmp
                let type = data[comfirmEventType];
                delete data[comfirmEventID];
                delete data[comfirmEventType];
                data = JSON.stringify(data);

                // tạo event mới
                e = {
                    ...e,
                    data,
                    eventId: eventID
                };

                if (
                    // nếu event là request và type là gửi request thì trigger
                    (
                        eventName == comfirmRequestEventName
                        && type == comfirmRequestType
                    )
                    // hoặc nếu event là answer và type là answer thì trigger
                    || (
                        eventName == comfirmAnswerEventName
                        && type == comfirmAnswerType
                    )
                ) {

                    handle(e);
                }
                return;
            }
        } catch (error) { }

        // nếu event là nhận thông tin bình thường thì trigger
        if (eventName == "onReceiveCallInfo") {
            handle(e);
        }
    };
};

/**
 * @todo hàm tạo info event comfirm
 * @param {string json} info 
 * @return string json
 */
const generateComfirmInfo = (callId, eventID, info, type) => {
    try {

        // mã sự kiện
        eventID = eventID || `requestComfirm-${(new Date()).getTime()}`;

        if (typeof info === "string") {

            info = JSON.parse(info);
        }
        info = info || {};

        // gắn tmp event id, type
        info[comfirmEventID] = eventID;
        info[comfirmEventType] = type;
        info["callId"] = callId;

        info = JSON.stringify(info);

        return info;
    } catch (error) {

        return info;
    }
};

/**
 * @todo hàm tạo info event comfirm
 * @param {string json} info 
 * @return string json
 */
export const generateRequestComfirm = (callId, eventID, info) => generateComfirmInfo(callId, eventID, info, comfirmRequestType);

/**
 * @todo hàm tạo info event answer comfirm
 * @param {string json} info 
 * @return string json
 */
export const generateAnswerComfirm = (callId, eventID, info) => generateComfirmInfo(callId, eventID, info, comfirmAnswerType);