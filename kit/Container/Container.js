import AliasLoader from '../Foundation/AliasLoader';
import abtractUniqueID from '../Utilities/abtractUniqueID';

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

        this._bindings = new Map();
        this._resolved = new Map();
        this._aliases = new Map();
    }

    bind(abstract, concrete = null, shared = false) {

        if (abstract === undefined) {

            throw new Error("Abstract is not support");
        }

        if (typeof concrete !== "function") {

            throw new Error("Concrete is not support");
        }

        let abstractID = abtractUniqueID(abstract);

        this._bindings.set(abstractID, {
            concrete,
            shared
        });
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

        let abstractID = abtractUniqueID(abstract);

        if (this._bindings.has(abstractID)) {

            const {
                concrete,
                shared
            } = this._bindings.get(abstractID);

            let instance = this._resolved.get(abstractID);
            let isResolved = this._resolved.has(abstractID);

            if (
                !shared
                || !isResolved
            ) {

                instance = concrete(this, ...parameters);
            }

            if ( shared ) {

                this._resolved.set(abstractID, instance);
            }

            return instance;
        }

        if( this.getAlias(abstract) !== undefined ) {

            return this.getAlias(abstract);
        }

        if (typeof abstract === "function") {

            return new abstract(this);
        }

        return undefined;
    }

    alias(abstract, alias) {

        let abstractID = abtractUniqueID(abstract);

        this._aliases.set(abstractID, alias);
        AliasLoader.register(abstract, alias);
    }

    getAlias(abstract) {

        let abstractID = abtractUniqueID(abstract);
        return this._aliases.get(abstractID);
    }
}

export default Container;