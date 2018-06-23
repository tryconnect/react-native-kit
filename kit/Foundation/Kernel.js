class Kernel {

    bootstrappers = [
        require("./Bootstrap/RegisterProviders").default,
        require("./Bootstrap/BootProviders").default
    ];

    constructor(app) {

        this.app = app;
    }

    handle(snapshot) {

        const response = app("response");
        response.setProvider(app().make("splashScreen"));

        this.bootstrap();

        return response;
    };

    bootstrap() {
        
        this.app.bootstrapWith(this.bootstrappers);
        delete this.bootstrappers;
    };

    getApplication() {

        return this.app;
    };
}

export default Kernel;