import { Platform } from 'react-native';
import ServiceProvider from '../Support/ServiceProvider';

class SplashScreenServiceProvider extends ServiceProvider {

    constructor(app) {
        super(app);

        if( Platform.OS == "android" ) {

            const SplashScreen = require('react-native-smart-splash-screen').default;
            const close = () => {

                const configs = app.configs('splashScreen') || {
                    animationType: SplashScreen.animationType.none,
                    duration: 500,
                    delay: 20
                };

                SplashScreen.close(configs);
            };

            app.starting(() => {
    
                if (app.isBooted()) {
    
                    return close();
                }
                app.booted(() => {

                    close();
                });
            });
        }
    }
}

export default SplashScreenServiceProvider;