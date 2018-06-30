import { AppState, Platform, BackHandler, AppRegistry } from 'react-native';
import Container from '../Container/Container';
import Component from '../Components/Application';
import registerComponent from '../Helpers/registerComponent';
import fireAppCallbacks from '../Helpers/fireAppCallbacks';
import registerBaseBindings from '../Helpers/registerBaseBindings';
import registerCoreContainerAliases from '../Helpers/registerCoreContainerAliases';
import registerBaseServiceProviders from '../Helpers/registerBaseServiceProviders';
import registerConfiguredProviders from '../Helpers/registerConfiguredProviders';
import ServiceProvider from '../Support/ServiceProvider';
import StepProgress from '../Queue/StepProgress';
import AsyncBlockingQueue from '../Queue/AsyncBlockingQueue';
import abtractUniqueID from '../Utilities/abtractUniqueID';

class Application extends Container {

    /**
     * @todo Khởi tạo app
     * @param {string} appName 
     * @param {object|function:object} configs 
     */
    constructor(appName, configs = {}) {
        super();
        Container.setInstance(this);

        // mảng service provider
        this._serviceProviders = new Map();
        // mảng các service callback khi được khởi tạo thì khởi tạo các service khác
        // được xoá khi không còn sử dụng
        this._whenRegisterServiceProviders = new Map();
        // mảng các callback khi đang khởi tạo app
        // được xoá sau khi boot xong
        this._bootingCallbacks = [];
        // mảng các callback khi app đã khởi tạo xong
        // được xoá sau khi boot xong
        this._bootedCallbacks = [];
        // cờ lưu trạng thái đã khởi tạo
        this._isBooted = false;
        // cờ lưu trạng thái đang khởi tạo
        this._isBooting = false;
        // queue đăng ký service provider
        // được xoá sau khi boot xong
        this._registerQueue = new AsyncBlockingQueue();
        // queue đăng ký service provider sau khi các service khác đã đăng ký xong
        // được xoá sau khi boot xong
        this._deferRegisterQueue = new AsyncBlockingQueue();
        // queue khởi động service provider
        // được xoá sau khi boot xong
        this._bootQueue = new AsyncBlockingQueue();

        // queue các bước khởi động
        this._bootProgess = new StepProgress();

        // mảng callback khi khởi động app
        this._startingCallbacks = [];
        // mảng callback khi app chuyển sang background
        this._shuttingCallbacks = [];

        // bind các service mặc định
        registerBaseBindings(this, configs);
        // bind các alias mặc định
        registerCoreContainerAliases(this, configs);
        // đăng ký các service provider mặc định
        registerBaseServiceProviders(this, configs);

        // hàm đăng ký các service, alias từ config
        this.registerConfiguredProviders = async () => {
            delete this.registerConfiguredProviders;

            return await registerConfiguredProviders(this, configs);
        };

        // register app xuống native
        registerComponent(appName, () => Component);

        this.appState = AppState.currentState;
        AppState.addEventListener("change", (state) => {

            if(state == "background") {

                this._shuttingCallbacks.map((callback) => {

                    return callback("APP_STATE");
                });
            } else if (state == "active") {

                this._startingCallbacks.map((callback) => {

                    return callback("APP_STATE");
                });
            }
            this.appState = state;
        });
    }

    bind(abstract, concrete, shared) {

        super.bind(abstract, concrete, shared);
        let option = {
            abstract,
            concrete,
            shared
        };
        this._bootProgess.createStep("app.bind", Promise.resolve(option), option);
    }

    /**
     * @todo Hàm lấy queue khởi động
     */
    getBootProgess() {
        
        return this._bootProgess;
    }

    /**
     * @todo Hàm đăng ký service provider
     * @param {class|object:ServiceProvider} provider 
     * @param {boolean} force 
     */
    register(provider, force = false) {
        
        let provideID = abtractUniqueID(provider);

        // hàm kiểm tra và khởi tạo service provider
        const getProvider = (provide) => {

            let provideID = abtractUniqueID(provide);

            // kiểm tra service provider đã đăng ký chưa
            // nếu đã đăng ký và không có ghi đè
            if (this._serviceProviders && this._serviceProviders.has(provideID) && !force) {

                // trả về service đã đăng ký
                return this._serviceProviders.get(provideID);
            }

            let instance = provide;

            // nếu service chưa khởi tạo thì khởi tạo
            if (typeof provide === "function") {

                instance = this.make(provide);
            }

            if (!(instance instanceof ServiceProvider)) {
                
                throw new Error("service provider is not support");
            }

            // check các service khởi tạo theo service hiện tại
            if (this._whenRegisterServiceProviders && this._whenRegisterServiceProviders.has(provideID)) {

                const {
                    register: registerCallback,
                    boot: bootCallback
                } = this._whenRegisterServiceProviders.get(provideID);
                
                this._whenRegisterServiceProviders.delete(provideID);
                if (!this._whenRegisterServiceProviders.size) {

                    delete this._whenRegisterServiceProviders;
                }

                const register = instance.register.bind(instance);
                const boot = instance.boot.bind(instance);

                instance.register = async () => {
                    await Promise.resolve(register());
                    await Promise.resolve(registerCallback());
                };

                instance.boot = async () => {
                    await Promise.resolve(boot());
                    await Promise.resolve(bootCallback());
                };
            }

            return instance;
        };

        let instance = getProvider(provider);

        // lấy các service đăng ký trong hàm provides
        let provides = (instance.provides && instance.provides()) || [];
        if (provides.length) {

            // khởi tạo service
            provides = provides.map(getProvider);
        }

        // hàm gọi register của service provider
        const register = async () => {

            await Promise.resolve(instance.register());
            if (provides.length) {

                for (let index = 0; index < provides.length; index++) {
                    let provide = provides[index];
                    if (provide && provide.register) {

                        await Promise.resolve(provide.register());
                    }
                }
            }
        };

        // hàm gọi boot của service provider
        const boot = async () => {
 
            await Promise.resolve(instance.boot());
            if (provides.length) {

                for (let index = 0; index < provides.length; index++) {
                    let provide = provides[index];
                    if (provide && provide.boot) {

                        await Promise.resolve(provide.boot());
                    }
                }
            }
        };

        // lấy danh sách các service khi đăng ký các service này thì mới đăng ký
        let when = (instance.when && instance.when()) || [];
        if (when.length) {
            
            when.forEach((provide) => {

                let provideID = abtractUniqueID(provide);
                bootCallback = registerCallback = () => Promise.resolve();
                if (!this._whenRegisterServiceProviders) {

                    this._whenRegisterServiceProviders = new Map();
                }

                if(this._whenRegisterServiceProviders.has(provideID)) {

                    let {
                        register: registerCallback,
                        boot: bootCallback
                    } = this._whenRegisterServiceProviders.get(provideID);
                }

                this._whenRegisterServiceProviders.set(provideID, {
                    register: async () => {

                        await registerCallback();
                        await register();
                    },
                    boot: async () => {

                        await bootCallback();
                        await boot();
                    }
                });
            });

            return instance;
        }

        // nếu app đã boot
        if (this.isBooted()) {
            (async () => {

                try {
                    
                    await register();
                    await boot();
                } catch (error) {
                    
                    if (error && !error.message) {

                        error = new Error(error);
                    }
                    if (!error.message) {

                        error.message = "Register Provider error";
                    }
                    error.code = error.code || 5;

                    this.make("events").emit("app.js.exception", {
                        error,
                        isFatal: true
                    });
                    throw error;
                }
            })();

            return instance;
        }

        if (this.isBooting()) {

            // nếu app đang boot
            (async () => {

                try {
                    
                    await register();
                    if (this.isBooted()) {
                        await boot();
                        return;
                    }
                    this.booted(boot);
                } catch (error) {
                    
                    if (error && !error.message) {

                        error = new Error(error);
                    }
                    if (!error.message) {

                        error.message = "Register Provider error";
                    }
                    error.code = error.code || 5;
                    error.isFatal = true;

                    this.make("events").emit("app.js.exception", {
                        error,
                        isFatal: true
                    });
                    throw error;
                }
            })();

            return instance;
        }

        // đăng ký service
        this._serviceProviders.set(provideID, instance);

        // nếu service cần load sau
        if( instance.isDeferred() ) {
            
            // đăng ký vào hằng đợi load sau
            this._deferRegisterQueue.enqueue( instance );

            // đăng ký các service trong hàm provides
            provides.forEach((provide) => {
                
                this._deferRegisterQueue.enqueue(provide);
            });
        } else { // nếu service cần load ngay

            // đăng ký vào hằng đợi load
            this._registerQueue.enqueue( instance );

            // đăng ký các service trong hàm provides
            provides.forEach((provide) => {

                this._registerQueue.enqueue(provide);
            });
        }

        return instance;
    }

    /**
     * @todo hàm boot service provider
     */
    async boot() {

        // nếu đã boot
        if( this.isBooted() || this.isBooting() ) {

            return await Promise.resolve();
        }

        this._isBooting = true;
        // gọi callback booting
        fireAppCallbacks(this, this._bootingCallbacks);
        delete this._bootingCallbacks;

        // hàm thực thi hằng đợi boot
        let runBootQueue = async () => {

            if (!this._bootQueue) {

                return await Promise.resolve();
            }

            // số phần tử trong hằng đợi
            let length = this._bootQueue.length;

            if (!length) {

                return await Promise.resolve();
            }

            for (let index = 0; index < length; index++) {
                    
                // lấy service provider từ hằng đợi
                let provider = await this._bootQueue.dequeue();

                // boot
                if(provider.boot) {

                    await Promise.resolve(provider.boot());
                }
            }
        };

        // thực thi hằng đợi boot
        await runBootQueue();
        delete this._serviceProviders;
        delete this._bootQueue;
        if(!this._whenRegisterServiceProviders.size) {
            delete this._whenRegisterServiceProviders;
        }

        this._isBooting = false;
        this._isBooted = true;

        // gọi callback booted
        fireAppCallbacks(this, this._bootedCallbacks);
        delete this._bootedCallbacks;
    }

    /**
     * @todo hàm đăng ký callback bắt đầu boot
     * @param {function} callback 
     */
    booting(callback) {

        if(typeof callback !== "function") {
            throw new Error("Booting callback is not support");
        }

        if(this.isBooted()) {
            return;
        }

        if (this.isBooting()) {

            fireAppCallbacks(this, [callback]);
            return;
        }

        this._bootingCallbacks && this._bootingCallbacks.push(callback);
    }

    /**
     * @todo hàm đăng ký callback đã boot xong
     * @param {function} callback 
     */
    booted(callback) {

        if (typeof callback !== "function") {

            throw new Error("Booted callback is not support");
        }

        if (this.isBooted()) {

            fireAppCallbacks(this, [callback]);
            return;
        }

        this._bootedCallbacks && this._bootedCallbacks.push(callback);
    }

    /**
     * @todo hàm thêm callback khi app chuyển sang background hoặc tắt
     * @param {function} callback 
     */
    shutting(callback) {

        if (typeof callback !== "function") {

            throw new Error("shutting callback is not support");
        }

        this._shuttingCallbacks.push(callback);
    }

    /**
     * @todo Hàm thêm callback khi app khởi động
     * @param {function} callback 
     */
    starting(callback) {

        if (typeof callback !== "function") {

            throw new Error("shutting callback is not support");
        }

        this._startingCallbacks.push(callback);
    }

    /**
     * @todo hàm kiểm tra app đã boot
     * @return boolean
     */
    isBooted() {

        return this._isBooted;
    }

    /**
     * @todo hàm kiểm tra app đang boot
     * @return boolean
     */
    isBooting() {

        return this._isBooting;
    }

    /**
     * @todo hàm thực thi hằng đợi đăng ký service provider cần load sau
     */
    loadDeferredProviders = async () => {
        delete this.loadDeferredProviders;

        if ( !this._deferRegisterQueue ) {

            return await Promise.resolve();
        }

        // số phần tử trong hằng đợi
        let length = this._deferRegisterQueue.length;

        if (!length) {

            delete this._deferRegisterQueue;
            return await Promise.resolve();
        }

        // hàm thực thi hằng đợi đăng ký service provider
        const runRegisterQueue = async () => {

            if (!this._deferRegisterQueue) {

                return await Promise.resolve();
            }

            let length = this._deferRegisterQueue.length;

            if (!length) {

                return await Promise.resolve();
            }

            for (let index = 0; index < length; index++) {

                // lấy service provider từ hằng đợi
                let provider = await this._deferRegisterQueue.dequeue();

                if (provider.register) {

                    await Promise.resolve(provider.register());
                }

                if (provider.boot) {

                    // nếu app đang boot
                    if (this.isBooting()) {

                        // đợi app boot xong thì gọi hàm boot
                        await new Promise((resolve) => {

                            this.booted(async () => {

                                // đợi hàm boot
                                await Promise.resolve(provider.boot());
                                resolve();
                            });
                        });
                    } else if (this.isBooted()) { // nếu app đã boot

                        // gọi hàm boot
                        await Promise.resolve(provider.boot());
                    } else { // nếu app chưa boot

                        // đăng ký hằng đợi boot
                        this._bootQueue.enqueue(provider);
                    }
                }
            }

            if (this._deferRegisterQueue.length) {

                await runRegisterQueue();
            }
        };

        // thực thi hằng đợi
        await runRegisterQueue();

        delete this._deferRegisterQueue;
    };

    /**
     * @todo Hàm bootstrap
     * @param {array:Bootstrap} bootstrappers
     */
    bootstrapWith = async (bootstrappers = []) => {

        this._bootProgess.excute();
        this._bootProgess.createStep("app.starting", Promise.resolve(), this);

        try {

            delete this.bootstrapWith;
            
            // hàm thực thi hằng đợi đăng ký service provider
            const runRegisterQueue = async () => {

                if (!this._registerQueue) {

                    return await Promise.resolve();
                }

                let length = this._registerQueue.length;

                if (!length) {

                    return await Promise.resolve();
                }

                for (let index = 0; index < length; index++) {

                    this._bootProgess.createStep("app.bootstrap.registerProvider", Promise.resolve(provider), provider);

                    // lấy service provider từ hằng đợi
                    let provider = await this._registerQueue.dequeue();
                    
                    if(provider.register) {

                        await Promise.resolve(provider.register());
                    }

                    if (provider.boot) {

                        this._bootProgess.createStep("app.bootstrap.bootProvider", Promise.resolve(provider), provider);

                        // nếu app đang boot
                        if (this.isBooting()) {
                            
                            // đợi app boot xong thì gọi hàm boot
                            await new Promise((resolve) => {

                                this.booted(async () => {

                                    // đợi hàm boot
                                    await Promise.resolve(provider.boot());
                                    resolve();
                                });
                            });
                        } else if (this.isBooted()) { // nếu app đã boot

                            // gọi hàm boot
                            await Promise.resolve(provider.boot());
                        } else { // nếu app chưa boot

                            // đăng ký hằng đợi boot
                            this._bootQueue.enqueue(provider);
                        }
                    }
                }

                // giải quyết register trong register
                if (this._registerQueue.length) {

                    await runRegisterQueue();
                }
            };
            
            this._bootProgess.createStep("app.bootstrapping", Promise.resolve(bootstrappers), bootstrappers);

            for (let key in bootstrappers) {
                if (bootstrappers.hasOwnProperty(key)) {
                    let bootstrapper = bootstrappers[key];
                    // khởi tạo bootstrap
                    bootstrapper = this.make(bootstrapper);
                    
                    this._bootProgess.createStep("app.bootstrap", Promise.resolve(bootstrappers), bootstrapper);

                    // đợi bootstrapped
                    await Promise.resolve(bootstrapper.bootstrap(this));
                    // thực thi hằng đợi đăng ký service provider
                    await runRegisterQueue();
                }
            }

            this._bootProgess.createStep("app.bootstrapped", Promise.resolve(bootstrappers), bootstrappers);

            // thực thi hằng đợi đăng ký service provider sau khi đã bootstrap xong
            await runRegisterQueue(); 
            // xoá hằng đợi
            delete this._registerQueue;
        } catch (error) {

            if (error && !error.message) {

                error = new Error(error);
            }
            if (!error.message) {

                error.message = "Bootstrap error";
            }
            error.code = error.code || 3;
            error.isFatal = true;
            this.make("events").emit("app.js.exception", {
                error,
                isFatal: true
            });
            throw error;
        }

        this._bootProgess.createStep("app.started", Promise.resolve(this), this);
    };

    /**
     * @todo hàm reload app
     * @param {boolean} force 
     */
    reload(force = true) {

        this.make("events").emit("app.reload", {force});
    }
    
    /**
     * @todo Hàm tắt app
     * @param {boolean} force 
     */
    exit(force = false) {

        try {
            
            let promises = this._shuttingCallbacks.map((callback) => {
    
                return callback("EXIT", force);
            });
    
            const exit = () => {
    
                Platform.OS == "android" && BackHandler.exitApp();
                // alert("Please restart application");
                // close();
            };
    
            if (force) {
    
                exit();
                return Promise.resolve();
            }
    
            return Promise.all(promises)
                .then(exit)
                .catch(exit)
            ;
        } catch (error) {
            
            if (error && !error.message) {

                error = new Error(error);
            }
            if (!error.message) {

                error.message = "Exit error";
            }
            error.code = error.code || 4;
            error.isFatal = true;

            this.make("events").emit("app.js.exception", {
                error,
                isFatal: true
            });
        }
    }

    /**
     * @todo Hàm đăng ký background js
     * @param {string} name 
     * @param {function: Provider} task 
     */
    registerHeadlessTask(name, task) {

        if(typeof task !== "function") {

            throw new Error("Headless js task is not support");
        }

        AppRegistry.registerHeadlessTask(name, task);
    }
}

export default Application;