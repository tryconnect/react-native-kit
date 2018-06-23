class AliasLoader {

    constructor(scope) {

        this.scope = scope;
    }

    register(name, instance) {

        if (this.isRegistered(name)) {

            return this;
        }
        this.scope[name] = instance;
        return this;
    }

    unregister(name) {

        try {
            this.scope[name] = undefined;
            delete this.scope[name];
        } catch (error) { }

        return this;
    }

    isRegistered(name) {

        return this.scope[name] !== undefined;
    }

    get(name) {

        return this.scope[name];
    }
}

export default new AliasLoader(this);