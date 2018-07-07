import { createLogic, createLogicMiddleware } from 'redux-logic';
import ServiceProvider from '../Support/ServiceProvider';

class ReduxLogicService extends ServiceProvider {

    async register() {

        const redux = app("redux");
        if (!redux) {

            return;
        }
        var {
            deps: dependencies = {},
            arrLogic: logics = []
        } = this.app.configs("reduxLogic") || this.app.configs("redux.logic") || {};

        var logicMiddleware;

        const getStore = redux.getStore.bind(redux);
        redux.getStore = () => {

            if(redux.store) {

                return redux.store;
            }
            logicMiddleware = createLogicMiddleware(logics, dependencies);
            redux.addMiddleware(logicMiddleware);
            return getStore();
        };

        this.app.alias("registerLogic", (option) => {

            const logic = createLogic(option);
            if (logicMiddleware) {

                logicMiddleware.addLogic(logic);
                return logic;
            }
            logics.push(logic);
            return logic;
        });

        redux.addCompileReducer((key, reducer, configs = {}) => {

            let {
                logic,
                generateLogic,
                deps,
                arrLogic
            } = configs || {};

            if (typeof generateLogic === "function") {

                logic = createLogic(generateLogic(key));
            }
            
            if (typeof logic === "object") {
                
                logicMiddleware && logicMiddleware.addLogic(logic);
                logics.push(logic);
            }

            if (typeof deps === "object") {

                logicMiddleware && logicMiddleware.addDeps(deps);
                dependencies = {
                    ...dependencies,
                    ...deps
                };
            }

            if (Array.isArray(arrLogic)) {

                logicMiddleware && logicMiddleware.mergeNewLogic(arrLogic);
                logics = [
                    ...logics,
                    arrLogic
                ];
            }

            return reducer;
        });
    }
}


export default ReduxLogicService;