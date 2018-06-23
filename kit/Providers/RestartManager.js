import { BackHandler, Platform } from 'react-native';
import ServiceProvider from '../Support/ServiceProvider';

class RestartManager extends ServiceProvider {

    constructor(app) {
        super(app);

        const CodePush = require("react-native-code-push");
        app.restart = (force = false) => {

            const restartApp = CodePush.restartApp || CodePush.default.restartApp;
            restartApp && restartApp();
        };

        app.exit = (force = false) => {

            if(Platform.OS == "android") {
                
                BackHandler.exitApp();
            }
        };
    }
}

export default RestartManager;