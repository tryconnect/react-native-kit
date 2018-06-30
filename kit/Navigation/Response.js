import React from 'react';
import { isElement, isReactComponent } from '../Utilities/componentDetect';

class Response {

    constructor(provider = null, props = {}) {

        this.provider = provider;
        this.props = props || {};
        this._compiler = compiler;
    }

    setProvider(provider) {

        this.provider = provider;
        return this;
    };

    setProps( props = {} ) {

        this.props = props || {};
        return this;
    };

    addProp(name, value) {

        this.props = {
            ...this.props,
            [name]: value
        };

        return this;
    };

    removeProp(name) {

        if( this.props ) {
            delete this.props[name];
        }
        return this;
    };

    send() {

        let element = this.compile(this.provider, this.props);

        app("events").emit("app.response", { element });
        return element;
    };

    compile(provider, props = {}) {

        return this._compiler(provider, props);
    }

    compileMiddleware(middleware) {
        if(typeof middleware !== "function") {

            throw new Error("Middleware is not support");
        }

        const compile = this._compiler;
        this._compiler = (provider, props) => {

            return compiler(middleware(compile(provider, props), props), props);
        };
    }
}

const compiler = (Component, props = {}) => {

    const {
        children,
        ...otherProps
    } = props || {};

    if (isReactComponent(Component)) {

        Component = (
            <Component {...otherProps}>
                {children}
            </Component>
        );
    }

    if (
        !isElement(Component)
        && typeof Component === "function"
    ) {

        Component = Component(props);
    }

    if (!Component) {

        Component = null;
    }

    return Component;
};

export default Response;