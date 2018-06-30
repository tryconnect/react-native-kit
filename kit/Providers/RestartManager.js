import ServiceProvider from '../Support/ServiceProvider';

class RestartManagerServiceProvider extends ServiceProvider {

    constructor(app) {
        super(app);

        const CodePush = require("react-native-code-push");

        app.restart = (force = false) => {

            
            const promises = app._shuttingCallbacks.map((callback) => {
                
                return callback("RESTART", force);
            });
            
            const restart = () => {
                const restartApp = CodePush.restartApp || CodePush.default.restartApp;
                return restartApp && restartApp();
            };

            if (force) {

                return Promise.resolve();
            }

            return Promise.all(promises)
                .then(restart)
                .catch(restart)
            ;
        };
    }
}

export default RestartManagerServiceProvider;