"use strict";
import React from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import Text from '~/components/Text';
import TouchableOpacity from '~/components/TouchableOpacity';
import Avatar from '~/components/Avatar';
import McIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, scale, fontSizes, sizes } from '~/configs/styles';

class PopupCaller extends React.PureComponent {

    static displayName = "@PopupCaller";

    static propTypes = {
        acceptOnPress: PropTypes.func,
        declineOnPress: PropTypes.func,
        avatar: PropTypes.string,
        profileName: PropTypes.string,
        callMessage: PropTypes.string,
        isConnected: PropTypes.bool
    };

    static defaultProps = {
        profileName: "unknown",
        callMessage: "",
        isConnected: true
    };

    render() {

        const {
            avatar,
            profileName,
            acceptOnPress,
            declineOnPress,
            callMessage,
            isConnected
        } = this.props;

        return (
            <View style={_styles.container}>
                <View style={_styles.boxLeft}>
                    <Avatar
                        source = {avatar}
                        style  = {_styles.avatar}
                    />
                </View>
                <View style={_styles.boxRight}>
                    <View style={_styles.contentContainer}>
                        <Text
                            style         = {_styles.profileName}
                            numberOflines = {2}
                        >{profileName}</Text>
                        {
                            !!callMessage && 
                                <Text
                                    style={_styles.callMessage}
                                >{callMessage}</Text>
                        }
                    </View>
                    <View style={_styles.buttonContainer}>
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
                </View>
            </View>
        );
    }
}

const _styles = {
    container: {
        width: "100%",
        flexDirection: "row"
    },
    boxLeft: {
        borderRightWidth: scale(1),
        borderBottomWidth: scale(1),
        borderColor: colors.border.normal
    },
    boxRight: {
        flex: 1
    },
    contentContainer: {
        flex: 1,
        padding: sizes.layout.spacing
    },
    avatar: {
        width: scale(100),
        height: scale(120),
        borderRadius: 0,
        resizeMode: "contain"
    },
    buttonContainer: {
        flexDirection: "row"
    },
    icon: {
        color: colors.icon.sinkingNormal,
        fontSize: scale(20)
    },
    buttonAccept: {
        flex: 1,
        height: scale(40),
        backgroundColor: colors.section.callAcceptButtonBackground,
        justifyContent: "center",
        alignItems: "center"
    },
    buttonDecline: {
        flex: 1,
        height: scale(40),
        backgroundColor: colors.section.callDeclineButtonBackground,
        justifyContent: "center",
        alignItems: "center"
    },
    profileName: {
        fontSize: fontSizes.large,
        color: colors.text.bold,
        fontWeight: "bold"
    },
    callMessage: {
        fontSize: fontSizes.small,
        color: colors.text.italic,
        fontStyle: "italic"
    }
};

export default PopupCaller;