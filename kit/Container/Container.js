import AliasLoader from '../Foundation/AliasLoader';

class Container {

    static setInstance = (instance) => {

        Container._instance = instance;
    };

    static getInstance = () => {

        if (!Container._instance) {
            Container._instance = new Container();
        }

        return Container._instance;
    };

    constructor() {

        this._bindings = {};
        this._resolved = {};
        this._aliases = {};
    }

    bind(abstract, concrete = null, shared = false) {

        if (abstract === undefined) {

            throw new Error("Abstract is not support");
        }

        if (typeof concrete !== "function") {

            throw new Error("Concrete is not support");
        }

        this._bindings[abstract] = {
            concrete,
            shared
        };
    }

    singleton(abstract, concrete) {

        this.bind(abstract, concrete, true);
    }

    make(abstract) {

        return this.resolve(abstract);
    }

    makeWith(abstract, parameters = []) {

        return this.resolve(abstract, parameters);
    }

    resolve(abstract, parameters = []) {

        if (this._bindings.hasOwnProperty(abstract)) {

            const {
                concrete,
                shared
            } = this._bindings[abstract];

            let instance = this._resolved[abstract];
            let isResolved = this._resolved.hasOwnProperty(abstract);

            if (
                !shared
                || !isResolved
            ) {

                instance = concrete(this, ...parameters);
            }

            if ( shared ) {

                this._resolved[abstract] = instance;
            }

            return instance;
        }

        if( this.getAlias(abstract) !== undefined ) {

            return this.getAlias(abstract);
        }

        if (typeof abstract === "function") {

            return new abstract(this);
        }
    }

    alias(abstract, alias) {

        this._aliases[abstract] = alias;
        AliasLoader.register(abstract, alias);
    }

    getAlias(abstract) {

        return this._aliases[abstract];
    }
}

export default Container;