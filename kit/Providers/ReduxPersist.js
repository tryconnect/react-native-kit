import { AsyncStorage } from 'react-native';
import { persistStore, persistReducer } from 'redux-persist';
import ServiceProvider from '../Support/ServiceProvider';

class ReduxPersistService extends ServiceProvider {

    async register() {

        const redux = app("redux");
        const configs = this.app.configs("reduxPersist") || this.app.configs("redux.persist");

        if (redux && configs) {

            let {
                storage = AsyncStorage,
                whitelist,
                blacklist
            } = configs;
            
            if (typeof storage === "string" && app("cacheManager")) {
    
                storage = await app("cacheManager").resolve(storage);
            }

            if (!storage.getItem || !storage.setItem) {
    
                throw new Error("Redux persist storage is not support");
            }
    
            const combineReducers = redux.combineReducers.bind(redux);
            redux.combineReducers = (reducers) => {
                
                return persistReducer({
                    key: 'root',
                    ...configs,
                    storage,
                    whitelist,
                    blacklist
                }, combineReducers(reducers));
            };

            const response = app("response");
            const getStore = redux.getStore.bind(redux);
            redux.getStore = () => {
    
                if (redux.store) {
    
                    return redux.store;
                }
    
                redux.store = getStore();
                redux.persistor = persistStore(redux.store);

                // waiting rehyrate
                response.lock();
                this._locked = true;

                this.addBootProgress();

                return redux.store;
            };

            redux.addCompileReducer((key, reducer, options = {}) => {

                const {
                    persist
                } = options || {};

                if (persist) {

                    if (!whitelist && !blacklist) {
                        
                        whitelist = [];
                    }

                    if (whitelist) {

                        whitelist.push(key);
                    }

                    if( blacklist ) {

                        blacklist.splice(blacklist.indexOf(key), 1);
                    }
                }

                return reducer;
            });

            this.app.bind("reduxPersist", () => {

                if (redux.persistor) {

                    return redux.persistor;
                }
                redux.getStore();
                return redux.persistor;
            });
        }
    }

    addBootProgress() {

        return new Promise((resolve) => {
            
            const persistor = app("reduxPersist");
            let length = persistor.getState().registry.length;
            const response = app("response");
            
            this.app.getBootProgess().createStep("redux.persist", (updatePeriod) => {
                
                const state = persistor.getState();
                if (state.bootstrapped) {
                    
                    updatePeriod(1, {
                        description: "done"
                    });
                    
                    this._locked && response.unlock();
                    response.send();

                    return resolve(state);
                }

                let unsubscribe = persistor.subscribe(() => {
                    const state = persistor.getState();

                    if (state.bootstrapped) {

                        unsubscribe && unsubscribe();

                        updatePeriod(1, {
                            description: "done"
                        });
                        
                        this._locked && response.unlock();
                        response.send();

                        return resolve(state);
                    }

                    let period = (state.registry.length / length) || 1;

                    updatePeriod(period, {
                        description: "rehyrate",
                        status: state.registry[0]
                    });
                });
            }, {
                description: "init"
            });
        });
    }
}


export default ReduxPersistService;