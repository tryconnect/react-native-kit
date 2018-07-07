/**
 * @todo class quản lý event
 */
class EventManager {

    constructor(emitter) {

        this._emitter = emitter;

        this._eventID = -1;
        this._subscription = {};
    }

    /**
     * @todo Hàm thêm sự kiện
     * @param string eventName: tên sự kiện
     * @param function handle: hàm xử lý
     */
    addListener = (eventName, handle, context = false) => {

        let event;
        let keepRemove = false
        if ( typeof context === "boolean" ) {

            keepRemove = context;
            context = undefined;
            if (keepRemove) {

                let rootHandle = handle;
                handle = (e) => {
                    
                    if (event && event.removed) {
    
                        event.remove && event.remove();
                    }
                    rootHandle(e);
                };
            }
        }

        // listen sự kiện
        event = this._emitter.addListener(eventName, handle, context);
        event.keepRemove = keepRemove;

        let remove = event.remove.bind(event);
        let listenerID = this._eventID++;

        event.remove = (...args) => {
            remove(...args);
            delete this._subscription[listenerID];
        };

        this._subscription[listenerID] = event;

        return event;
    };

    /**
     * @todo hàm huỷ toàn bộ event
     */
    removeAllListeners = () => {

        Object.keys(this._subscription).forEach((eventID) => {

            if (this._subscription[eventID]) {

                if (this._subscription[eventID].keepRemove) {
                    
                    return this._subscription[eventID].removed = true;
                }
                
                this._subscription[eventID].remove 
                    && this._subscription[eventID].remove()
                ;
    
                delete this._subscription[eventID];
            }
        });
        this._subscription = {};
    };

    /**
     * @todo hàm huỷ toàn bộ event
     */
    destroy = () => {

        this.removeAllListeners();
        this._eventID = -1;
    };
}

export default EventManager;