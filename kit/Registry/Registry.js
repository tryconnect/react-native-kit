/**
 * @flow
*/
"use strict";
const Registry = function Registry(name, iterable) {

    // khởi tạo phương thức
    const instance = new Map(iterable);
    instance.name = name;
    instance.__proto__ = Registry.prototype.__proto__;

    const listeners = {};
    var eventId = 0;
    const supportEvent = [
        "change",
        "clear",
        "delete",
        "added"
    ];

    // hàm set
    instance.set = function set(key, value) {

        // lấy value củ
        const oldValue = instance.get(key);
        let has = instance.has(key);

        let result = Registry.prototype.set.apply(instance, [key, value]);

        if (!has) {

            app("events").emit(`registry.${instance.name}.added`, { key, value });
            return result;
        }

        // nếu value củ khác value mới
        if (oldValue !== value) {

            app("events").emit(`registry.${instance.name}.change`, { key, value });
        }

        return result;
    };

    // hàm xoá
    instance.clear = function clear() {

        Registry.prototype.clear.apply(instance, []);

        app("events").emit(`registry.${instance.name}.clear`, {});
    };

    instance.delete = function (key) {

        Registry.prototype.delete.apply(instance, [key]);
        app("events").emit(`registry.${instance.name}.delete`, { key });
    };

    // hàm remove, init sự kiện
    instance.removeAllEventListener = function removeAllEventListener() {

        for (let key in listeners) {
            if (listeners.hasOwnProperty(key)) {
                const subscriber = listeners[key];
                subscriber && subscriber.remove && subscriber.remove();
                delete listeners[key];
            }
        }
    };

    // init 3 event chính: change, clear, delete
    instance.removeAllEventListener();

    // thêm sự kiện
    instance.addEventListener = function addEventListener(eventName, listenKey, listenhandle) {

        if (!supportEvent.includes(eventName)) {

            throw new Error(`Missing event name ${eventName}`);
        }

        if (typeof listenKey === "function") {

            listenhandle = listenKey;
            listenKey = null;
        }

        if (typeof listenhandle !== "function") {

            throw new Error(`Missing event handle ${eventName}`);
        }

        eventId++;
        let subscriber;
        let remove;

        switch (eventName) {
            case "change":
                
                subscriber = app("events").addListener(`registry.${instance.name}.change`, ({key, value}) => {

                    if (!listenKey) {

                        return listenhandle({ key, value });
                    }

                    if (listenKey == key) {

                        listenhandle(value);
                    }
                });
                remove = subscriber.remove.bind(subscriber);
                subscriber.remove = () => {

                    remove();
                    delete listeners[eventId];
                };

                listeners[eventId] = subscriber;
                return subscriber;

            case "delete":

                let deleteEventId = eventId;

                let clearSubscriber;
                let deleteSubscriber = app("events").addListener(`registry.${instance.name}.delete`, ({ key, value }) => {

                    if (!listenKey) {

                        return listenhandle({key});
                    }

                    if (listenKey == key) {

                        listenhandle(key);
                    }
                });

                let removeDel = deleteSubscriber.remove.bind(deleteSubscriber);
                deleteSubscriber.remove = () => {

                    removeDel();
                    delete listeners[deleteEventId];
                };
                listeners[deleteEventId] = deleteSubscriber;

                if (listenKey && instance.has(listenKey)) {

                    let clearEventId = ++eventId;

                    clearSubscriber = app("events").addListener(`registry.${instance.name}.clear`, () => {

                        listenhandle(listenKey);
                    });

                    let removeClear = clearSubscriber.remove.bind(clearSubscriber);
                    clearSubscriber.remove = () => {

                        removeClear();
                        delete listeners[clearEventId];
                    };
                    listeners[clearEventId] = clearSubscriber;
                }
                
                return {

                    remove: () => {
                        deleteSubscriber && deleteSubscriber.remove && deleteSubscriber.remove();
                        clearSubscriber && clearSubscriber.remove && clearSubscriber.remove();
                    }
                };

            case "clear":

                subscriber = app("events").addListener(`registry.${instance.name}.clear`, ({ key, value }) => {

                    listenhandle();
                });
                remove = subscriber.remove.bind(subscriber);
                subscriber.remove = () => {

                    remove();
                    delete listeners[eventId];
                };

                listeners[eventId] = subscriber;
                return subscriber;

            case "added":

                subscriber = app("events").addListener(`registry.${instance.name}.added`, ({ key, value }) => {

                    if (!listenKey) {

                        return listenhandle({ key, value });
                    }
                    
                    if (listenKey == key) {

                        listenhandle(value);
                    }
                });

                listeners[eventId] = subscriber;
                return subscriber;
        }
    };

    return instance;
};
Registry.__proto__ = Map;
Registry.prototype.__proto__ = Map.prototype;

export default Registry;