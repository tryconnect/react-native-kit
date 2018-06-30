import React from 'react';
import { Provider } from 'react-redux';
import ServiceProvider from '../../Support/ServiceProvider';
import { isReactComponent } from '../../Utilities/componentDetect';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

class ReduxServiceProvider extends ServiceProvider {

    register() {

        const Redux = require("./Redux").default;

        // config redux
        let configs = this.app.configs("redux") || {};

        // khởi tạo redux
        const redux = new Redux(configs);

        // check nếu có service navigation
        const navigation = app("navigation");
        if (navigation) {

            this.registerCompileNavigation(redux, navigation);
        }

        this.app.singleton("redux", () => {
            
            configs = this.app.configs("redux") || {};
            if (
                !redux.initState &&
                configs.initState !== redux.initState
            ) {

                redux.setInitState(configs.initState);
            }

            return redux;
        });

        // đăng ký alias đăng ký reducer
        this.app.alias("registerReducer", (...args) => {

            app('redux').registerReducer(...args);
        });
    }

    boot() {

        const redux = app("redux");
        configs = this.app.configs("redux") || {};
        if (
            !redux.initState &&
            configs.initState !== redux.initState
        ) {

            redux.setInitState(configs.initState);
        }

        const response = app("response");
        response.compileMiddleware((children) => {

            return (
                <Provider store={redux.getStore()}>
                    {children}
                </Provider>
            );
        });
    }

    /**
     * @todo Hàm đăng ký middleware compile vào navigation
     * @param {Redux} redux 
     * @param {object} navigation 
     */
    registerCompileNavigation(redux, navigation) {

        // add compile route
        navigation.compileMiddleware((routeName, configuration = {}) => {

            return compileContainerScreen(
                redux,
                routeName,
                compileReducerScreen(
                    redux, 
                    routeName, 
                    configuration
                )
            );
        });
    }
}

const compileReducerScreen = (redux, routeName, configuration = {}) => {
    
    let reduxOptions = configuration.reduxOptions || configuration.redux;
    if (typeof reduxOptions !== "object") {

        return configuration;
    }

    // nếu không có reducer
    if (typeof reduxOptions.reducerOptions !== "object") {

        return configuration;
    }

    let {
        reducer,
        generateReducer,
        options: reducerConfigs = {}
    } = reduxOptions.reducerOptions;

    // khởi tạo reducer
    if (typeof generateReducer === "function") {

        reducer = generateReducer(routeName);
    }

    if (typeof reducer !== "function") {

        return configuration;
    }

    // đăng ký reducer
    redux.registerReducer(
        routeName,
        reducer,
        reducerConfigs
    );

    return configuration;
};

const compileContainerScreen = (redux, routeName, configuration = {}) => {

    let reduxOptions = configuration.reduxOptions || configuration.redux;
    if (typeof reduxOptions !== "object") {

        return configuration;
    }

    if (typeof reduxOptions.containerOptions !== "object") {

        return configuration;
    }

    let {
        container,
        mapStateToProps,
        mapDispatchToProps,
        mergeProps,
        options: containerConfigs = {
            withRef: true,
            pure: false
        },
        actions,
        generateActions
    } = reduxOptions.containerOptions;

    if (isReactComponent(container)) {

        configuration.screen = container;
        return configuration;
    }

    if (typeof generateActions === "function") {

        actions = generateActions(routeName);
    }

    // khởi tạo container
    container = connect(
        (state, ...args) => {

            let reducers = state[routeName] || {};

            let props = {
                reducers
            };

            if (typeof mapStateToProps === "function") {

                props = mapStateToProps(state, ...args) || {};

                reducers = {
                    ...props.reducers,
                    ...reducers
                };

                props = {
                    ...props,
                    reducers
                };
                return props;
            }

            return props;
        },
        (dispatch, ...args) => {

            let reduxActions = actions ? bindActionCreators(actions, dispatch) : {}
            let props = {
                dispatch,
                actions: reduxActions
            };

            if (typeof mapDispatchToProps === "function") {

                props = mapDispatchToProps(dispatch, ...args) || {};

                reduxActions = {
                    ...props.actions,
                    ...reduxActions
                };

                props = {
                    ...props,
                    actions: reduxActions
                };
                return props;
            }

            return props;
        },
        mergeProps,
        containerConfigs
    )(configuration.screen);

    if (isReactComponent(container)) {

        configuration.screen = container;
    }

    return configuration;
};

export default ReduxServiceProvider;