import { AsyncStorage } from 'react-native';
import ServiceProvider from '../Support/ServiceProvider';

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
            
            let keys = await AsyncStorage.getAllKeys();
            keys = keys || [];
            let counter = 0;

            if (keys.includes(storedKey)) {

                counter = await AsyncStorage.getItem(storedKey);
            }

            counter = counter * 1;
            counter = counter + 1;

            await AsyncStorage.setItem(storedKey, `${counter}`);

            if (counter > 3) {

                alert("Application Error!");
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

            return await AsyncStorage.setItem(storedKey, `0`);
        });
    }
}

export default ExceptionHandleServiceProvider;