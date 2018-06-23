"use strict";
import React from 'react';

class Application extends React.Component {

    static displayName = "@Application";

    constructor() {
        super();

        const response = app("response");
        
        this._isMounted = false;
        this._mountedCallback = null;
        this._event = app("events");

        this.state = {
            children: response.send()
        };

        this._responseEvent = this._event.addListener("app.response", ({ element }) => {

            if (this._isMounted) {

                return this.setState({
                    children: element
                });
            }

            this._mountedCallback = () => this.setState({
                children: element
            });
        });

        this._reloadEvent = this._event.addListener("app.reload", () => {

            if (this._isMounted) {

                return this.setState({
                    children: null
                }, () => {

                    this.setState({
                        children: response.send()
                    });
                });
            }

            this._mountedCallback = () => this.setState({
                children: null
            }, () => {
                
                this.setState({
                    children: response.send()
                });
            });
        });
    }

    getSnapshotBeforeUpdate() {

        this._event.emit("app.component.update");
        this._isMounted = false;
    }

    shouldComponentUpdate(nextProps, nextState) {

        return (
            this.state.children !== nextState.children
        );
    }

    render() {

        this._event.emit("app.component.render");
        return this.state.children;
    }

    componentDidMount() {

        this._isMounted = true;
        if( this._mountedCallback ) {

            this._mountedCallback();
        }

        this._event.emit("app.component.mounted");
    }

    componentDidUpdate() {
        
        this._isMounted = true;
        if (this._mountedCallback) {

            this._mountedCallback();
        }
        this._event.emit("app.component.updated");
    }

    componentWillUnmount() {

        this._responseEvent
            && this._responseEvent.remove
            && this._responseEvent.remove()
        ;

        this._reloadEvent
            && this._reloadEvent.remove
            && this._reloadEvent.remove()
        ;

        this._event.emit("app.component.unmount");
    }
}

export default Application;