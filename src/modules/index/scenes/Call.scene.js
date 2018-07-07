"use strict";
import React from 'react';
import PropTypes from 'prop-types';
import { View, BackHandler, Keyboard } from 'react-native';
import CallScene from '~/components/CallScene';
import { RNCamera } from 'react-native-camera';

class Call extends React.Component {

    static displayName = "@Call";

    constructor(props) {
        super(props);

        this._stringeeCall = app("stringeeCall");
        this._stringeeClient = app("stringeeClient");

        const {
            state: {
                params: {
                    callId = "",
                    isVideoCall = false,
                    isOutgoingCall,
                    from: From,
                    fromAlias,
                    to,
                    toAlias
                } = {}
            } = {}
        } = props.navigation;

        this.state = {
            callHandles: [this._buildCallInfo({
                callId,
                isVideoCall,
                isOutgoingCall,
                from: From,
                fromAlias,
                to,
                toAlias
            })]
        };
    }

    render() {

        return (
            <View style={_styles.container}>
                {
                    this.state.callHandles.map((callInfo = {}, index) => {

                        let isOutgoingCall = callInfo.isOutgoingCall;
                        let callId = callInfo.callId;

                        return (
                            <CallScene
                                {...callInfo}
                                key={`call-${isOutgoingCall ? "to" : "from"}-${isOutgoingCall ? callInfo.to : callId}`}
                                onEnded={() => {

                                    const callHandles = this.state.callHandles.slice();
                                    callHandles.splice(index, 1);
                                    if (callHandles.length == 1) {

                                        callHandles[0].isPopup = false;
                                    }

                                    if (!callHandles.length) {

                                        this.props.navigation.goBack();
                                    }

                                    this.setState({
                                        callHandles
                                    });
                                }}
                            />
                        );
                    })
                }
            </View>
        );
    }

    componentDidMount() {

        Keyboard.dismiss();
        this._backHandle = BackHandler.addEventListener("hardwareBackPress", () => {

            return true;
        });
        this._stringeeClient.addListener("onIncomingCall", this._onIncomingCall);
    }

    componentWillUnmount() {

        this._stringeeClient.destroy();
        this._stringeeCall.destroy();

        this._backHandle && this._backHandle.remove();
    }

    /**
     * @todo event handle cuộc gọi đến
     */
    _onIncomingCall = (e) => {

        const callHandles = this.state.callHandles.slice();

        callHandles.push(this._buildCallInfo({
            ...e,
            isOutgoingCall: false,
            isPopup: true
        }));

        this.setState({
            callHandles
        });
    };

    /**
     * @todo hàm tạo thông tin cuộc gọi
     */
    _buildCallInfo = (callInfo = {}) => {

        const {
            state: {
                params: {
                    cameraType = RNCamera.Constants.Type.front,
                    flashMode = RNCamera.Constants.FlashMode.on,
                    isEnableVideo = false,
                    isMuted = false,
                    isEnableSpeaker = false
                } = {}
            } = {}
        } = this.props.navigation;

        const {
            callId = "",
            isVideoCall = false,
            isOutgoingCall,
            from: From,
            fromAlias,
            to,
            toAlias,
            isPopup
        } = callInfo || {};

        return {
            callId,
            cameraType,
            flashMode,
            isVideoCall,
            isEnableVideo,
            isMuted,
            isEnableSpeaker,
            isOutgoingCall,
            from: From,
            fromAlias,
            to,
            toAlias,
            isPopup
        };
    };
}

const _styles = {
    container: {
        flex: 1
    }
};

export default Call;