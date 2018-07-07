"use strict";
import React from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import TouchableOpacity from '~/components/TouchableOpacity';
import McIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, scale } from '~/configs/styles';

class AnsweredCallBar extends React.PureComponent {

    static displayName = "@AnsweredCallBar";

    static propTypes = {
        style: PropTypes.object,
        muteOnPress: PropTypes.func,
        isMuted: PropTypes.bool,
        muteDisable: PropTypes.bool,
        speakerOnPress: PropTypes.func,
        isEnableSpeaker: PropTypes.bool,
        speakerDisable: PropTypes.bool,
        hangupOnPress: PropTypes.func.isRequired
    };

    static defaultProps = {
        muteDisable: false,
        isMuted: false,
        isEnableSpeaker: false,
        speakerDisable: false,
        isVideoCall: false,
        isEnableVideo: false
    };

    render() {

        const {
            style,
            muteOnPress,
            isMuted,
            muteDisable,
            speakerOnPress,
            isEnableSpeaker,
            speakerDisable,
            hangupOnPress
        } = this.props;

        return (
            <View
                style         = {[_styles.container, style]}
                pointerEvents = "box-none"
            >
                <TouchableOpacity
                    disabled = {muteDisable}
                    style    = {[_styles.menuButton, isMuted && _styles.menuButtonActive]}
                    onPress  = {muteOnPress}
                >
                    <McIcon
                        name  = {!isMuted ? "microphone": "microphone-off"}
                        style = {[_styles.icon, isMuted && _styles.iconActive]}
                    />
                </TouchableOpacity>

                <TouchableOpacity
                    disabled = {speakerDisable}
                    style    = {[_styles.menuButton, isEnableSpeaker && _styles.menuButtonActive]}
                    onPress  = {speakerOnPress}
                >
                    <McIcon
                        name={isEnableSpeaker ? "volume-high" : "volume-off"}
                        style={[_styles.icon, isEnableSpeaker && _styles.iconActive]}
                    />
                </TouchableOpacity>

                <TouchableOpacity
                    style   = {[_styles.menuButton, _styles.btnEndCall]}
                    onPress = {hangupOnPress}
                >
                    <McIcon
                        name  = "phone-hangup"
                        style = {_styles.icon}
                    />
                </TouchableOpacity>
            </View>
        );
    }
}

const _styles = {
    container: {
        width: "100%",
        flexDirection: "row",
        justifyContent: "space-around"
    },
    icon: {
        color: colors.icon.sinkingNormal,
        fontSize: scale(35)
    },
    menuButton: {
        width: scale(50),
        height: scale(50),
        borderRadius: scale(25),
        margin: scale(5),
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.2)"
    },
    menuButtonActive: {
        backgroundColor: colors.icon.sinkingNormal
    },
    iconActive: {
        color: colors.icon.normal
    },
    btnEndCall: {
        backgroundColor: colors.section.callDeclineButtonBackground
    }
};

export default AnsweredCallBar;