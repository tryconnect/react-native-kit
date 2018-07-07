import { AsyncStorage } from 'react-native';
import ServiceProvider from '../Support/ServiceProvider';
import GenericUser from './GenericUser';
import throttledPromise from '../Utilities/throttledPromise';

const timeoutCache = 20000;
class UserServiceProvider extends ServiceProvider {

    constructor(application) {
        super(application);

        var {
            storage = AsyncStorage
        } = application.configs("auth") || {};
        this.storage = storage;

        var authenticatable = null;
        this.rememberMe = false;

        const auth = {
            // get instance user
            user: () => authenticatable,
            // lấy id user
            id: () => {

                if (authenticatable) {

                    return authenticatable.getAuthIdentifier();
                }
            },
            // hàm kiểm tra đăng nhập
            check: () => {

                return !!authenticatable;
            },
            // hàm đăng nhập
            attempt: async (credentials = {}, remember = true) => {
                
                app("events").emit("auth.attempt", {
                    credentials,
                    remember
                });
                this.rememberMe = remember;

                let user = await this.retrieveByCredentials(credentials);
                if (user) {

                    user = this.getGenericUser(user);
                    user = await auth.login(user, remember, credentials);
                }
                
                return user;
            },
            // hàm đăng nhập bằng token đã lưu
            viaRemember: async () => {

                let step;
                if (!application.isBooted()) {

                    const bootProgess = application.getBootProgess();
                    if (bootProgess.isRunning()) {

                        step = bootProgess.current();
                        if (step.name != "auth.check.login") {

                            step = null;
                        }
                    }
                }

                step && step.updatePeriod(0.2, {
                    description: "getting cache"
                });
                let rememberToken = await this.storage.getItem("remember-token");
                let identifier = await this.storage.getItem("remember-identifier");
                
                let user = null;
                if (rememberToken) {

                    app("events").emit("auth.authenticated", {
                        rememberToken,
                        identifier
                    });

                    step && step.updatePeriod(0.4, {
                        description: "login"
                    });

                    user = await this.retrieveByToken(identifier, rememberToken);

                    step && step.updatePeriod(0.6, {
                        description: "logged"
                    });
                    if (user) {

                        user = this.getGenericUser(user);

                        step && step.updatePeriod(0.8, {
                            description: "setting cache"
                        });
                        user = await auth.login(user);
                    }
                }

                return user;
            },
            // hàm đăng nhập bằng user
            login: async (user = null, remember = false, credentials = null) => {

                this.rememberMe = remember;
                if ( user ) {

                    if (credentials && !this.validateCredentials(user, credentials)) {

                        app("events").emit("auth.login.failed", {
                            user,
                            credentials,
                            remember
                        });
                        return null;
                    }
                    
                    if (
                        authenticatable
                        && authenticatable.getRememberToken() !== user.getRememberToken()
                    ) {
                        
                        this.updateRememberToken(authenticatable, user.getRememberToken());
                    } else if (remember) {

                        await this._rememberUser(user);
                    }

                    app("events").emit("auth.login.successfully", {
                        user,
                        credentials,
                        remember
                    });
                    authenticatable = user;
                    return authenticatable;
                }

                if (remember) {

                    await this._rememberUser(null);
                }
                
                app("events").emit("auth.login.failed", {
                    user,
                    credentials,
                    remember
                });
                authenticatable = null;
                return null;
            },
            // hàm đăng nhập bằng id
            loginUsingId: async (identifier, remember = true) => {

                app("events").emit("auth.usingId", {
                    identifier,
                    remember
                });
                this.rememberMe = remember;

                let user = await this.retrieveById(identifier);

                if (user) {

                    user = this.getGenericUser(user);
                    user = await auth.login(user, remember);
                }
                
                return user;
            },
            // hàm đăng xuất
            logout: async () => {

                await this._rememberUser(null);

                app("events").emit("auth.logout", {
                    user: authenticatable
                });
                authenticatable = null;
            },
            addListener: (name, handle) => {

                return app("events").addListener(`auth.${name}`, handle);
            },
            EVENTS: {
                LOGIN: "login.successfully",
                LOGOUT: "logout",
                ATTEMPT: "attempt",
                AUTHENTICATED: "authenticated",
                FAILED: "login.failed",
                SUCCESS: "login.successfully"
            }
        };

        application.alias("auth", auth);
    }

    async _rememberUser(user) {
        if (
            this.storage
            && this.storage.setItem
        ) {

            if (user && user.getRememberToken()) {

                    await this.storage.setItem("remember-token", user.getRememberToken());
            } else {

                await this.storage.removeItem("remember-token");
            }
            if (user && user.getAuthIdentifier()) {

                await this.storage.setItem("remember-identifier", user.getAuthIdentifier());
            } else {

                await this.storage.removeItem("remember-identifier");
            }
        }
    }

    async register() {

        if (typeof this.storage === "string" && app("cacheManager")) {

            this.storage = await app("cacheManager").resolve(this.storage);
        }

        const updateRememberToken = this.updateRememberToken.bind(this);
        this.updateRememberToken = async (user, token) => {

            updateRememberToken(user, token);
            if(this.rememberMe) {

                this._rememberUser(user);
            }
        };
        
        this.app.getBootProgess().createStep("auth.check.login", async (updatePeriod) => {
            
            try {
                
                await throttledPromise(auth.viaRemember, timeoutCache, "check login fail")();
                return updatePeriod(1, {
                    description: "done",
                    user: auth.user()
                });
            } catch (error) {

                updatePeriod(1, {
                    description: "failed",
                    error
                });
            }
        }, {
            description: "checking"
        });
    }

    async retrieveById(identifier) {

        return null;
    }

    async retrieveByToken(identifier, token) {

        return null;
    }

    async retrieveByCredentials(credentials = {}) {

        return null;
    }

    async updateRememberToken(user, token) {

        if (user) {

            user.setRememberToken(token);
        }
    }

    validateCredentials(user, credentials = {}) {

        return user instanceof GenericUser;
    }

    getGenericUser(user = null) {
        
        if (
            user &&
            !(user instanceof GenericUser)
            && typeof user === "object"
        ) {

            user = new GenericUser(user);
        }

        return user;
    }
}

export default UserServiceProvider;