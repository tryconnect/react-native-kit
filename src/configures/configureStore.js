import { persistStore } from 'redux-persist';
import { createStore, compose, applyMiddleware } from 'redux';
import { createEpicMiddleware } from 'redux-observable';
import thunk from 'redux-thunk';
import { createReactNavigationReduxMiddleware } from 'react-navigation-redux-helpers';
// import screenTracking from '~/middleware/screenTracking';
// import logger from '~/middleware/logger';
// import 'rxjs';

// const pingEpic = action$ => {
//     console.log(action$);
//     return action$.filter(action => action.type === '/home#fetch')
//         .mapTo({ type: 'PONG' });
// }

const navMiddleware = createReactNavigationReduxMiddleware('$$navigation', state => state["$$navigation"]);

export default (reducers, rootEpic) => {

    const middleware = [
        thunk,
        navMiddleware
    ];

    if (rootEpic) {

        middleware.push(createEpicMiddleware(rootEpic));
    }

    if (!__DEV__) {

        middleware.push(require("~/middleware/screenTracking").default);
    }

    // middleware.push(logger);

    const enhancer = !middleware.length ? undefined : compose(
        // next => (reducer, initialState, enhancer) => {

        //     return next(reducer, initialState, enhancer);
        // },
        applyMiddleware(
            ...middleware
        )
    );

    const store = createStore(reducers, {}, enhancer);

    // store.dispatch({
    //     type: "PING"
    // });

    const persistor = persistStore(store);
    return { persistor, store };
};