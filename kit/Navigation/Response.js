import React from 'react';
import { isElement, isReactComponent } from '../Utilities/componentDetect';

class Response {

    constructor(provider = null, props = {}) {

        this.provider = provider;
        this.props = props || {};
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

        let Element = this.provider;
        const {
            children,
            ...otherProps
        } = this.props || {};
        
        if (isReactComponent(Element)) {
            
            Element = (
                <Element {...otherProps}>
                    {children}
                </Element>
            );
        }
        
        if (
            !isElement(Element)
            && typeof Element === "function"
        ) {

            Element = Element(props);
        }

        if ( !Element ) {
            Element = null;
        }

        app("events").emit("app.response", { element: Element });
        return Element;
    };
}

export default Response;