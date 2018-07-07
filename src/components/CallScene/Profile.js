"use strict";
import React from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import Text from '~/components/Text';
import Avatar from '~/components/Avatar';
import { colors, scale, fontSizes } from '~/configs/styles';

class Profile extends React.PureComponent {

    static displayName = "@Profile";

    static propTypes = {
        style: PropTypes.object,
        avatar: PropTypes.string,
        profileName: PropTypes.string
    };

    static defaultProps = {
        profileName: "unknown"
    };

    render() {

        const {
            style,
            avatar,
            profileName
        } = this.props;

        return (
            <View 
                style         = {[_styles.container, style]}
                pointerEvents = "box-none"
            >
                <View style={_styles.avatarBox}>
                    <Avatar 
                        source = {avatar}
                        style  = {_styles.avatar}
                    />
                </View>
                {
                    !!profileName &&
                        <Text style={_styles.userName}>{profileName}</Text>
                }
            </View>
        );
    }
}

const _styles = {
    container: {
        alignItems: "center",
        marginTop: scale(30)
    },
    userName: {
        fontSize: fontSizes.large,
        fontWeight: "bold",
        color: colors.text.sinkingBold,
        textAlign: "center"
    },
    avatar: {
        width: scale(150),
        height: scale(150),
        borderRadius: scale(75),
        resizeMode: "contain"
    },
    avatarBox: {
        marginBottom: scale(20),
        borderBottomWidth: scale(2),
        borderRightWidth: scale(2),
        borderLeftWidth: scale(1),
        borderColor: colors.border.callAvatarShadow,
        width: scale(160),
        height: scale(160),
        borderRadius: scale(80),
        padding: scale(5),
        backgroundColor: colors.section.callAvatarBackground
    }
};

export default Profile;