import ServiceProvider from '../../Support/ServiceProvider';

class NavigationServiceProvider extends ServiceProvider {

    register() {
        
        // hàm prefix routeName và option component
        const routeConfiguration = require("./routeConfiguration").default;
        const StackViewStyleInterpolator = require("./StackViewStyleInterpolator").default;
        
        // middleware compile route
        var enhancer = (configuration) => configuration;

        const navigation = {
            routeConfiguration: (name, screen, init = {}) => {
                
                // prefix
                let configuration = routeConfiguration(name, screen);

                // prefix init route name
                let initialRouteName = init.initialRouteName || "/";
                initialRouteName = initialRouteName.replace(/[\/]+/g, "/");
                if (!initialRouteName.startsWith(name)) {

                    let initialRouteName = `/${name}/${initialRouteName}`.replace(/[\/]+/g, "/");
                }
                
                let initialRouteParams = init.initialRouteParams || {};

                // callback middleware compile
                for (let key in configuration) {
                    if (configuration.hasOwnProperty(key)) {
                        
                        // call middleware
                        let {
                            screen,
                            path,
                            navigationOptions
                        } = enhancer({
                            routeName: key,
                            configuration: configuration[key]
                        }).configuration || {};

                        // config route
                        configuration[key] = {
                            screen,
                            path,
                            navigationOptions
                        };
                    }
                }

                return {
                    ...init,
                    routeConfiguration: configuration,
                    initialRouteName,
                    initialRouteParams
                };
            },
            StackViewStyleInterpolator,
            StackViewStyle: StackViewStyleInterpolator,
            Interpolator: StackViewStyleInterpolator,
            compileMiddleware: (middleware) => { // hàm thêm middleware compile

                if (typeof middleware !== "function") {

                    throw new Error("Navigation routeConfiguration middleware is not support");
                }

                const compose = require("../../Utilities/compose").default;
                const enhancerAdvance = enhancer;

                enhancer = compose(
                    ({routeName, configuration}) => {
                        
                        configuration = middleware(routeName, configuration) || configuration;
                        return {routeName, configuration};
                    },
                    (configuration) => enhancerAdvance(configuration)
                );
                return enhancer;
            }
        };
        
        this.app.bind("navigation", () => navigation);

        this.app.alias("route", (name, screen, init) => {

            return app("navigation").routeConfiguration(name, screen, init);
        });
    }

    boot() {

    }
}

export default NavigationServiceProvider;