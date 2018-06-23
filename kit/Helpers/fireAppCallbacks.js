export default (container, callbacks = []) => {

    callbacks && callbacks.length && callbacks.forEach((callback) => {

        callback(container);
    });
};