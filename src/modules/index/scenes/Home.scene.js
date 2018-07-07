"use strict";
import React from 'react';
import PropTypes from 'prop-types';
import { View, Text, TextInput, Keyboard, BackHandler } from 'react-native';
import Button from '~/components/Button';

import CallManager from '~/kit/VoiceCall/CallManager';

class Home extends React.Component {

    static displayName = "@Home";

    constructor(props) {
        super(props);

        this.state = {
            mobile: "096554476",
            loading: false,
            test: "545345345345"
        };

        this._stringeeClient = app("stringeeClient");
    }

    render() {

        const client = this._stringeeClient.client() || {};

        return (
            <View style={_styles.container}>
                <Text>login as: {client.userId}</Text>
                <TextInput
                    autoFocus={true}
                    style={_styles.input}
                    keyboardType="phone-pad"
                    value={this.state.mobile}
                    onChangeText={this._mobileOnChangeText}
                    editable={!this.state.loading}
                    onSubmitEditing={this._voiceOnPress}
                    ref={this.ref}
                />
                <View style={_styles.buttonContainer}>
                    <Button
                        loading={this.state.loading}
                        style={_styles.btnVoiceCall}
                        onPress={this._voiceOnPress}
                    >Voice Call</Button>
                </View>

                <Button
                    loading={this.state.loading}
                    style={_styles.btnVideoCall}
                    onPress={() => {

                        this._stringeeClient.disconnect((err) => {

                            if (!err) {

                                this.props.navigation.goBack();
                            }
                        });
                    }}
                >Logout</Button>

            </View>
        );
    }

    componentDidMount() {

        this._stringeeClient.addListener("onDisConnect", this._onDisConnect);
        // this._stringeeClient.addListener("onIncomingCall", this._onIncomingCall);

        this._backHandle = BackHandler.addEventListener("hardwareBackPress", () => {

            return true;
        });
    }

    componentWillUnmount() {

        this._stringeeClient.destroy();
        Keyboard.dismiss();

        this._backHandle && this._backHandle.remove();
    }

    // sự kiện click voice call
    _voiceOnPress = () => {

        Keyboard.dismiss();
        const client = this._stringeeClient.client() || {};
        call({
            from: client.userId,
            to: this.state.mobile,
            isOutgoingCall: true,
            isVideoCall: false
        });
    };

    // sự kiện click gọi video
    _videoOnPress = () => {

        Keyboard.dismiss();
        const client = this._stringeeClient.client() || {};
        this.props.navigation.navigate("/call", {
            from: client.userId,
            to: this.state.mobile,
            isOutgoingCall: true,
            isVideoCall: true
        });
    };

    // sự kiện nhập số điện thoại
    _mobileOnChangeText = (mobile = "") => {
        this.setState({
            mobile
        });
    };

    // sự kiện mất kết nối
    _onDisConnect = () => {

        // this.props.navigation.navigate("Login");
        // this.props.navigation.goBack();
    };

    // sự kiện có cuộc gọi
    _onIncomingCall = (data) => {
        Keyboard.dismiss();

        let currentCall = CallManager.getCurrentHandle();
        if (!currentCall) {

            return this.props.navigation.navigate("/call", {
                ...data,
                callId: data.callId,
                from: data.from,
                to: data.to,
                isOutgoingCall: false,
                isVideoCall: data.isVideoCall
            });
        }
    };
}

const _styles = {
    container: {
        flex: 1
    },
    input: {
        width: "100%",
        fontSize: 30
    },
    buttonContainer: {
        width: "100%",
        flexDirection: "row"
    },
    btnVoiceCall: {
        width: "50%",
        height: 50,
        backgroundColor: "#0006ff",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "row"
    },
    btnVideoCall: {
        width: "50%",
        height: 50,
        backgroundColor: "red",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "row"
    }
};

export default Home;