import Container from '../Container/Container';
import Component from '../Components/Application';
import registerComponent from '../Helpers/registerComponent';
import fireAppCallbacks from '../Helpers/fireAppCallbacks';
import registerBaseBindings from '../Helpers/registerBaseBindings';
import registerCoreContainerAliases from '../Helpers/registerCoreContainerAliases';
import registerBaseServiceProviders from '../Helpers/registerBaseServiceProviders';
import registerConfiguredProviders from '../Helpers/registerConfiguredProviders';
import ServiceProvider from '../Support/ServiceProvider';
import AsyncBlockingQueue from '../Queue/AsyncBlockingQueue';

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
        this._whenRegisterServiceProviders = new Map();
        // mảng các callback khi đang khởi tạo app
        this._bootingCallbacks = [];
        // mảng các callback khi app đã khởi tạo xong
        this._bootedCallbacks = [];
        // cờ lưu trạng thái đã khởi tạo
        this._isBooted = false;
        // cờ lưu trạng thái đang khởi tạo
        this._isBooting = false;
        // queue đăng ký service provider
        this._registerQueue = new AsyncBlockingQueue();
        // queue đăng ký service provider sau khi các service khác đã đăng ký xong
        this._deferRegisterQueue = new AsyncBlockingQueue();
        // queue khởi động service provider
        this._bootQueue = new AsyncBlockingQueue();

        // bind các service mặc định
        registerBaseBindings(this);
        // bind các alias mặc định
        registerCoreContainerAliases(this);
        // đăng ký các service provider mặc định
        registerBaseServiceProviders(this);

        // hàm đăng ký các service, alias từ config
        this.registerConfiguredProviders = async () => {
            delete this.registerConfiguredProviders;

            return await registerConfiguredProviders(this, configs);
        };

        // register app xuống native
        registerComponent(appName, () => Component);
    }

    /**
     * @todo Hàm đăng ký service provider
     * @param {class|object:ServiceProvider} provider 
     * @param {boolean} force 
     */
    register(provider, force = false) {

        // hàm kiểm tra và khởi tạo service provider
        const getProvider = (provide) => {

            // kiểm tra service provider đã đăng ký chưa
            // nếu đã đăng ký và không có ghi đè
            if (this._serviceProviders && this._serviceProviders.has(provider) && !force) {

                // trả về service đã đăng ký
                return this._serviceProviders.get(provider);
            }

            let instance = provide;

            // nếu service chưa khởi tạo thì khởi tạo
            if (typeof provide === "function") {

                instance = this.make(provide);
            }

            if (!(instance instanceof ServiceProvider)) {

                throw new Error("service provider is not support");
            }

            if (this._whenRegisterServiceProviders.has(provide)) {

                const callback = this._whenRegisterServiceProviders.get(provide);
                this._whenRegisterServiceProviders.delete(provide);

                const register = instance.register;
                instance.register = async () => {
                    await Promise.resolve(register());
                    await Promise.resolve(callback());
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

            if (instance.register) {

                try {
                    await Promise.resolve(instance.register());
                    if (provides.length) {

                        for (let index = 0; index < provides.length; index++) {
                            let provide = provides[index];
                            if (provide && provide.register) {

                                await Promise.resolve(provide.register());
                            }
                        }
                    }
                } catch (error) { }
                return;
            }
            return await Promise.resolve();
        };

        // hàm gọi boot của service provider
        const boot = async () => {
 
            if (instance.boot) {

                try {
                    await Promise.resolve(instance.boot());
                    if (provides.length) {

                        for (let index = 0; index < provides.length; index++) {
                            let provide = provides[index];
                            if (provide && provide.boot) {

                                await Promise.resolve(provide.boot());
                            }
                        }
                    }
                } catch (error) { }
                return;
            }
            return await Promise.resolve();
        };

        // lấy danh sách các service khi đăng ký các service này thì mới đăng ký
        let when = (instance.when && instance.when()) || [];
        if (when.length) {

            when.forEach((provide) => {

                let callback = () => Promise.resolve();
                if(this._whenRegisterServiceProviders.has(provide)) {

                    callback = this._whenRegisterServiceProviders.get(provide);
                }

                this._whenRegisterServiceProviders.set(provide, async () => {

                    try {
                        await callback();
                        await register();
                        if( this.isBooted() ) {

                            await boot();
                        } else if(this.isBooting()){

                            // đợi app boot xong thì gọi hàm boot
                            await new Promise((resolve) => {

                                this.booted(async () => {

                                    try {

                                        // đợi hàm boot
                                        await Promise.resolve(boot());
                                    } catch (error) { }
                                    resolve();
                                });
                            });
                        } else {

                            // đăng ký hằng đợi boot
                            this._bootQueue.enqueue(instance);
                        }
                    } catch (error) {}
                });
            });

            return instance;
        }

        // nếu app chưa boot
        if( 
            !this.isBooting() 
            && !this.isBooted()
        ) {
            // đăng ký service
            this._serviceProviders.set(provider, instance);

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

        // nếu app đã boot
        if( this.isBooted() ) {
            (async () => {

                await register();
                await boot();
            })();

            return instance;
        }

        // nếu app đang boot
        (async () => {

            await register();
            if (this.isBooted()) {
                await boot();
                return;
            }
            this.booted(boot);
        })();

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

                try {
                    
                    // lấy service provider từ hằng đợi
                    let provider = await this._bootQueue.dequeue();

                    // boot
                    if(provider.boot) {

                        await Promise.resolve(provider.boot());
                    }
                } catch (error) {}
            }
        };

        try {
            // thực thi hằng đợi boot
            await runBootQueue();
            delete this._serviceProviders;
            delete this._bootQueue;
        } catch (error) {}

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

                try {

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

                                    try {

                                        // đợi hàm boot
                                        await Promise.resolve(provider.boot());
                                    } catch (error) { }
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

                } catch (error) { }
            }

            if (this._deferRegisterQueue.length) {

                await runRegisterQueue();
            }
        };

        try {
            // thực thi hằng đợi
            await runRegisterQueue();
        } catch (error) {}

        delete this._deferRegisterQueue;
    };

    /**
     * @todo Hàm bootstrap
     * @param {array:Bootstrap} bootstrappers
     */
    bootstrapWith = async (bootstrappers = []) => {
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

                try {
                    
                    // lấy service provider từ hằng đợi
                    let provider = await this._registerQueue.dequeue();

                    if(provider.register) {

                        await Promise.resolve(provider.register());
                    }

                    if (provider.boot) {

                        // nếu app đang boot
                        if (this.isBooting()) {
                            
                            // đợi app boot xong thì gọi hàm boot
                            await new Promise((resolve) => {

                                this.booted(async () => {

                                    try {

                                        // đợi hàm boot
                                        await Promise.resolve(provider.boot());
                                    } catch (error) { }
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

                } catch (error) {}
            }

            // giải quyết register trong register
            if (this._registerQueue.length) {

                await runRegisterQueue();
            }
        };
        
        for (let key in bootstrappers) {
            if (bootstrappers.hasOwnProperty(key)) {
                let bootstrapper = bootstrappers[key];
                // khởi tạo bootstrap
                bootstrapper = this.make(bootstrapper);
                
                try {
                    
                    // đợi bootstrapped
                    await Promise.resolve(bootstrapper.bootstrap(this));
                    // thực thi hằng đợi đăng ký service provider
                    await runRegisterQueue();
                } catch (error) {}
            }
        }

        try {
            
            // thực thi hằng đợi đăng ký service provider sau khi đã bootstrap xong
            await runRegisterQueue(); 
        } catch (error) {}
        // xoá hằng đợi
        delete this._registerQueue;
    };

    /**
     * @todo hàm reload app
     * @param {boolean} force 
     */
    reload(force = true) {

        this.make("events").emit("app.reload", {force});
    }
}

export default Application;