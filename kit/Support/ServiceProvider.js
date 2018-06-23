class ServiceProvider {

    defer = false;
    
    constructor(container) {

        this.app = container;
    }

    register() {

    }

    boot() {
        
    }

    provides() {

        return [];
    }

    when() {

        return [];
    }

    isDeferred() {

        return this.defer;
    }
}

export default ServiceProvider;