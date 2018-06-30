import ServiceProvider from '../Support/ServiceProvider';

class FirebaseCrashReportServiceProvider extends ServiceProvider {

    constructor(app) {
        super(app);
        
        if (app.configs("env") == "production") {

            const firebase = require("react-native-firebase").default;
            let eventHandle = ({error}) => {
                
                let crash = firebase.crash();
                crash.log(error.message);
                crash.report(error);
            };
            app.make("events").addListener("app.js.exception", eventHandle);
            app.make("events").addListener("app.native.exception", eventHandle);
        }
    }
}

export default FirebaseCrashReportServiceProvider;