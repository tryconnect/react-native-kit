"use strict";
import React from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import Text from '~/components/Text';
import { colors, scale, fontSizes } from '~/configs/styles';

class Message extends React.PureComponent {

    static displayName = "@Message";

    static propTypes = {
        type: PropTypes.oneOf([
            "error",
            "warning",
            "success"
        ]),
        children: PropTypes.string,
        style: PropTypes.object,
        messageStyle: PropTypes.object
    };

    static defaultProps = {
        children: ""
    };

    render() {

        const {
            style,
            type,
            children,
            messageStyle
        } = this.props;

        return (
            <View 
                pointerEvents="box-none"
                style={[
                    _styles.container,
                    style,
                    type === "success" && _styles.containerSuccess,
                    type === "warning" && _styles.containerWarning,
                    type === "error" && _styles.containerError
                ]}
            >
                <Text 
                    style={[
                        _styles.message,
                        messageStyle
                    ]}
                    numberOflines={1}
                >{children}</Text>
            </View>
        );
    }
}

const _styles = {
    container: {
        height: scale(30),
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        justifyContent: "center",
        alignItems: "center",
        zIndex: 101
    },
    containerError: {
        backgroundColor: colors.section.errorBackground
    },
    containerWarning: {
        backgroundColor: colors.section.warningBackground
    },
    containerSuccess: {
        backgroundColor: colors.section.successBackground
    },
    message: {
        width: "100%",
        fontSize: fontSizes.normal,
        color: colors.text.sinkingNormal,
        textAlign: "center"
    }
};

export default Message;