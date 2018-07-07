import React from 'react';
import { isElement, isReactComponent } from '../Utilities/componentDetect';

class Response {

    constructor(provider = null, props = {}) {

        this.provider = provider;
        this.props = props || {};
        this._compiler = compiler;
        this._element = null;
        this._locked = false;
    }

    setProvider(provider) {

        this.provider = provider;
        return this;
    };

    getElement() {

        return this._element;
    }

    getProvider() {

        return this.provider;
    }

    setProps( props = {} ) {

        this.props = props || {};
        return this;
    };

    getProps() {

        return this.props;
    }

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

    lock() {

        this._locked = true;
    }

    unlock() {

        this._locked = false;
    }

    send() {

        this._element = this.compile(this.provider, this.props);

        !this._locked && app("events").emit("app.response", { element: this._element });
        return this._element;
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

export const compiler = (Component, props = {}) => {

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