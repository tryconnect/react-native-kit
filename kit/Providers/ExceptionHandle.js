import { AsyncStorage } from 'react-native';
import ServiceProvider from '../Support/ServiceProvider';
import throttledPromise from '../Utilities/throttledPromise';

const timeoutCache = 20000;
class ExceptionHandleServiceProvider extends ServiceProvider {

    constructor(app) {
        super(app);

        const storedKey = "__number-of-reboot__";

        const exceptionHandler = require("react-native-exception-handler");
        
        exceptionHandler.setJSExceptionHandler((error, isFatal) => {

            if(error) {

                error.isFatal = isFatal;
                app.make("events").emit("app.js.exception", {
                    error,
                    isFatal
                });
            }
        }, true);

        exceptionHandler.setNativeExceptionHandler((exceptionString) => {

            if(exceptionString) {

                let error = new Error(exceptionString);
                let isFatal = true;
                error.isFatal = isFatal;

                app.make("events").emit("app.native.exception", {
                    error,
                    isFatal
                });
            }
        }, false);

        const errorHandle = global.ErrorUtils.getGlobalHandler();
        global.ErrorUtils.setGlobalHandler((error, isFatal) => {

            try {
                if (!error.message) {
                    error = new Error(error);
                }
                error.isFatal = isFatal;
                app.make("events").emit("app.js.exception", {
                    error,
                    isFatal
                });
            } catch (error) {}
            errorHandle && errorHandle(error, isFatal);
        });

        app.make("events").addListener("app.js.exception", async ({ error, isFatal }) => {
            if(__DEV__) {

                alert("Application Error!");
                console.log(error);
                global.close && global.close();
                return;
            }
            
            let keys = await throttledPromise(
                AsyncStorage.getAllKeys, 
                timeoutCache, 
                "Check crash restart failed"
            )();

            keys = keys || [];
            let counter = 0;

            if (keys.includes(storedKey)) {

                counter = await throttledPromise(
                    AsyncStorage.getItem,
                    timeoutCache,
                    "Check crash restart failed"
                )(storedKey);
            }

            counter = counter * 1;
            counter = counter + 1;

            await throttledPromise(
                AsyncStorage.setItem,
                timeoutCache,
                "Check crash restart failed"
            )(storedKey, `${counter}`);

            if (counter > 3) {

                alert("Application Error!");
                await throttledPromise(
                    AsyncStorage.multiRemove,
                    timeoutCache,
                    "Check crash restart failed"
                )(keys);
                global.close && global.close();
                return;
            }

            if (error.isFatal || isFatal) {
    
                return setTimeout(() => {

                    if (app.restart) {

                        return app.restart();
                    }
                    app.reload();
                }, 0);
            }
        });

        app.booted(async () => {

            return await throttledPromise(
                AsyncStorage.setItem,
                timeoutCache,
                "Check crash restart failed"
            )(storedKey, `0`);
        });
    }
}

export default ExceptionHandleServiceProvider;