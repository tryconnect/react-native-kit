import ServiceProvider from '../Support/ServiceProvider';

class FirebaseCrashReport extends ServiceProvider {

    constructor(app) {
        super(app);

        const firebase = require("react-native-firebase").default;
        let eventHandle = ({error, isFatal}) => {
            
            // firebase.crash().log(error.message);
            // firebase.crash().report(error);
            if(isFatal) {

                app.restart && app.restart();
            }
        };
        app.make("events").addListener("app.js.exception", eventHandle);
        app.make("events").addListener("app.native.exception", eventHandle);
    }
}

export default FirebaseCrashReport;