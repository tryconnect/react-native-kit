"use strict";
import React from 'react';
import PropTypes from 'prop-types';
import { View, Keyboard, BackHandler } from 'react-native';
import { RNCamera } from 'react-native-camera';
import CallScene from '~/components/CallScene';

class CallScreen extends React.Component {

    static displayName = "@CallScreen";

    static propTypes = {
        callId: PropTypes.string,
        isVideoCall: PropTypes.bool,
        isOutgoingCall: PropTypes.bool,
        from: PropTypes.string,
        fromAlias: PropTypes.string,
        to: PropTypes.string,
        toAlias: PropTypes.string,
        cameraType: PropTypes.oneOf([
            RNCamera.Constants.Type.front,
            RNCamera.Constants.Type.back
        ]),
        flashMode: PropTypes.oneOf([
            RNCamera.Constants.FlashMode.on,
            RNCamera.Constants.FlashMode.off
        ]),
        isEnableVideo: PropTypes.bool,
        isMuted: PropTypes.bool,
        isEnableSpeaker: PropTypes.bool,
        onEnded: PropTypes.func.isRequired
    };

    static defaultProps = {
        cameraType: RNCamera.Constants.Type.front,
        flashMode: RNCamera.Constants.FlashMode.on,
        isEnableVideo: false,
        isMuted: false,
        isEnableSpeaker: false
    };

    constructor( props ) {
        super( props );

        this._stringeeCall = app("stringeeCall");
        this._stringeeClient = app("stringeeClient");

        const {
            callId = "",
            isVideoCall = false,
            isOutgoingCall,
            from: From,
            fromAlias,
            to,
            toAlias
        } = props;

        this.state = {
            callHandles: [
                this._buildCallInfo({
                    callId,
                    isVideoCall,
                    isOutgoingCall,
                    from: From,
                    fromAlias,
                    to,
                    toAlias
                })
            ]
        };
    }

    static getDerivedStateFromProps( nextProps, prevState ) {


        return null;
    };

    getSnapshotBeforeUpdate( nextProps, prevState ) {

        return null;
    };

    shouldComponentUpdate( nextProps, nextState ) {
        
        return true;
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
                                key     = {`call-${isOutgoingCall ? "to" : "from"}-${isOutgoingCall ? callInfo.to : callId}`}
                                onEnded = {() => {

                                    const callHandles = this.state.callHandles.slice();
                                    callHandles.splice(index, 1);
                                    if (callHandles.length == 1) {

                                        callHandles[0].isPopup = false;
                                    }

                                    if (!callHandles.length) {

                                        this.props.onEnded && this.props.onEnded();
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

    componentDidUpdate( nextProps, prevState, snapshot ) {
        
    }

    componentWillUnmount() {

        this._stringeeClient.destroy();
        this._stringeeCall.destroy();

        this._backHandle && this._backHandle.remove();
    }

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
     * @todo Hàm tạo thông tin cuộc gọi
     */
    _buildCallInfo = (callInfo = {}) => {

        const {
            cameraType = RNCamera.Constants.Type.front,
            flashMode = RNCamera.Constants.FlashMode.on,
            isEnableVideo = false,
            isMuted = false,
            isEnableSpeaker = false
        } = this.props;

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

export default CallScreen;