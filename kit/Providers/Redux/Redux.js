import { createStore, compose, applyMiddleware, combineReducers } from 'redux';

class Redux {

    constructor(configs = {}) {

        const {
            middleware = [],
            enhancer = [],
            store = null,
            initState,
            reducers = {}
        } = configs;

        this.store = store || null;
        this.middleware = middleware || [];
        this.enhancer = enhancer || [];
        this.initState = initState;
        this.reducers = reducers || {};

        this._compileReducer = (key, reducer, configs = {}) => {

            reducer.$$typeOf = key;
            reducer.$$type = "reducer";
            reducer.$$key = key;
            reducer.typeOf = () => key;

            return reducer;
        };
    }

    createStore(...args) {

        return createStore(...args);
    }

    applyMiddleware(...args) {

        return applyMiddleware(...args);
    }

    compose(...args) {

        return compose(...args);
    }

    combineReducers(...args) {

        return combineReducers(...args);
    }

    build() {

        let enhancer;
        if (this.enhancer.length || this.middleware.length) {

            let middleware;
            if (this.middleware.length) {

                middleware = this.applyMiddleware(
                    ...this.middleware
                );
            }

            enhancer = this.compose(
                ...this.enhancer,
                middleware
            );
        }

        return this.createStore(
            this.combineReducers(this.reducers),
            this.initState || {},
            enhancer
        );
    }

    getStore() {

        if(this.store) {

            return this.store;
        }

        this.store = this.build();
        return this.store;
    }

    registerReducer(key, reducer, configs = {}) {

        this.reducers[key] = this._compileReducer(key, reducer, configs);
        if(this.store) {

            this.store.replaceReducer(this.combineReducers(this.reducers));
        }
        return reducer;
    }

    addCompileReducer(compiler) {

        const compile = this._compileReducer;
        this._compileReducer = (key, reducer, configs = {}) => {

            reducer = compile(key, reducer, configs);
            return compiler(key, reducer, configs);
        };
    }

    addMiddleware(middleware) {

        this.middleware.push(middleware);
        return this;
    }

    prependMiddleware(middleware) {

        this.middleware.unshift(middleware);
        return this;
    }

    setInitState(state) {

        this.initState = state;
    }
}

export default Redux;