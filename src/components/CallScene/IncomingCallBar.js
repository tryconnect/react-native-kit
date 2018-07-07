"use strict";
import React from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import TouchableOpacity from '~/components/TouchableOpacity';
import McIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, scale } from '~/configs/styles';

class IncomingCallBar extends React.PureComponent {

    static displayName = "@IncomingCallBar";

    static propTypes = {
        style: PropTypes.object,
        acceptOnPress: PropTypes.func.isRequired,
        declineOnPress: PropTypes.func.isRequired,
        isConnected: PropTypes.bool
    };

    static defaultProps = {
        isConnected: true
    };

    render() {

        const {
            style,
            acceptOnPress,
            declineOnPress,
            isConnected
        } = this.props;

        return (
            <View 
                style         = {[_styles.container, style]}
                pointerEvents = "box-none"
            >
                <TouchableOpacity
                    onPress  = {acceptOnPress}
                    style    = {_styles.buttonAccept}
                    disabled = {!isConnected}
                >
                    <McIcon name="phone" style={_styles.icon} />
                </TouchableOpacity>

                <TouchableOpacity
                    onPress = {declineOnPress}
                    style   = {_styles.buttonDecline}
                >
                    <McIcon name="phone-hangup" style={_styles.icon} />
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
    buttonAccept: {
        width: scale(70),
        height: scale(70),
        borderRadius: scale(35),
        backgroundColor: colors.section.callAcceptButtonBackground,
        justifyContent: "center",
        alignItems: "center"
    },
    buttonDecline: {
        width: scale(70),
        height: scale(70),
        borderRadius: scale(35),
        backgroundColor: colors.section.callDeclineButtonBackground,
        justifyContent: "center",
        alignItems: "center"
    }
};

export default IncomingCallBar;