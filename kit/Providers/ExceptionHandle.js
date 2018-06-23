import ServiceProvider from '../Support/ServiceProvider';

class ExceptionHandle extends ServiceProvider {

    constructor(app) {
        super(app);

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
    }
}

export default ExceptionHandle;