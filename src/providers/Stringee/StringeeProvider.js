"use strict";
import React from 'react';
import PropTypes from 'prop-types';
import { View, Keyboard } from 'react-native';
import CallScreen from './CallScreen';
import CallManager from '~/kit/VoiceCall/CallManager';

class StringeeProvider extends React.Component {

    static displayName = "@StringeeProvider";

    static propTypes = {
        client: PropTypes.object.isRequired
    };

    constructor( props ) {
        super( props );

        this.state = {
            callInfo: null
        };
    }

    getSnapshotBeforeUpdate( nextProps, prevState ) {

        return null;
    };

    shouldComponentUpdate( nextProps, nextState ) {
        
        return true;
    }

    render() {

        const {
            children
        } = this.props;

        return (
            <View style={_styles.container}>
                {
                    children
                }
                {
                    !!this.state.callInfo &&
                        <View style={_styles.callScene}>
                            <CallScreen
                                {...this.state.callInfo}
                                onEnded = {this._onEnded}
                            />
                        </View>
                }
            </View>
        );
    }

    componentDidMount() {
        
        this._eventIncomming = this.props.client.addListener("onIncomingCall", this._onIncomingCall);
        this._eventMakeCall = app("events").addListener("stringee.makeCall", (callInfo = {}) => {

            this.setState({
                callInfo
            });
        });
    }

    componentWillUnmount() {

        this._eventIncomming && this._eventIncomming.remove();
        this._eventMakeCall && this._eventMakeCall.remove();
    }

    _onEnded = () => {

        this.setState({
            callInfo: null
        });
    };

    _onIncomingCall = (data = {}) => {

        console.log(data);
        Keyboard.dismiss();

        let currentCall = CallManager.getCurrentHandle();
        if (!currentCall) {

            this.setState({
                callInfo: {
                    ...data,
                    callId: data.callId,
                    from: data.from,
                    to: data.to,
                    isOutgoingCall: false,
                    isVideoCall: data.isVideoCall
                }
            });
        }
    };
}

const _styles = {
    container: {
        flex: 1
    },
    callScene: {
        position: "absolute",
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        zIndex: 100
    }
};

export default StringeeProvider;