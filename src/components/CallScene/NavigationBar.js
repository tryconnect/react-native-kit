"use strict";
import React from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import McIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import Text from '~/components/Text';
import TouchableOpacity from '~/components/TouchableOpacity';
import { colors, sizes, scale, fontSizes } from '~/configs/styles';

class NavigationBar extends React.PureComponent {

    static displayName = "@NavigationBar";

    static propTypes = {
        style: PropTypes.object,
        isEnableVideo: PropTypes.bool,
        swichCameraOnPress: PropTypes.func,
        bandwidth: PropTypes.number,
        maxBandwidth: PropTypes.number,
        menuOnPress: PropTypes.func,
        message: PropTypes.string
    };

    static defaultProps = {
        isEnableVideo: false,
        bandwidth: 0,
        maxBandwidth: 35000,
        message: ""
    };

    render() {

        const {
            style,
            isEnableVideo,
            swichCameraOnPress,
            bandwidth,
            maxBandwidth,
            menuOnPress,
            children,
            message
        } = this.props;

        let cellular = Math.floor(bandwidth / (maxBandwidth / 3));
        if (cellular > 3) {
            cellular = 3;
        }
        let iconName = `signal-cellular-${cellular}`;
        if (cellular <= 0) {

            iconName = `signal-cellular-outline`;
        }

        let iconColor = colors.icon.callCellularGood;
        switch (cellular) {
            case 0:

                iconColor = colors.icon.callCellularBad;
                break;
            case 1:

                iconColor = colors.icon.callCellularNormal;
                break;
            case 2:

                iconColor = colors.icon.callCellularNormal;
                break;

            case 3:

                iconColor = colors.icon.callCellularGood;
                break;
        }

        return (
            <View style={[_styles.container, style]}>
                <View style={_styles.boxLeft}>
                    {children}
                </View>
                <View style={_styles.boxCenter}>
                    {
                        !!message && 
                            <Text 
                                style         = {_styles.message}
                                numberOfLines = {1}
                            >{message}</Text>
                    }
                </View>
                <View style={_styles.boxRight}>
                    {
                        !!isEnableVideo &&
                            <TouchableOpacity 
                                style   = {_styles.iconWrapper}
                                onPress = {swichCameraOnPress}
                            >
                                <McIcon
                                    name  = "camera-switch"
                                    style = {_styles.icon}
                                />
                            </TouchableOpacity>
                    }
                    <View
                        pointerEvents="box-none"
                        style={_styles.iconWrapper}
                    >
                        <McIcon
                            name  = {iconName}
                            style = {[_styles.icon, {
                                color: iconColor
                            }]}
                        />
                    </View>
                    {

                        !!menuOnPress && 
                            <TouchableOpacity 
                                style   = {_styles.iconWrapper}
                                onPress = {menuOnPress}
                            >
                                <McIcon
                                    name  = "apps"
                                    style = {_styles.icon}
                                />
                            </TouchableOpacity>
                    }
                </View>
            </View>
        );
    }
}

const _styles = {
    container: {
        height: scale(30),
        backgroundColor: colors.section.callNavigatorBackground,
        alignItems: "center",
        flexDirection: "row",
        paddingHorizontal: scale(5),
        paddingVertical: scale(2)
    },
    boxLeft: {
        height: "100%",
        alignItems: "center",
        justifyContent: "flex-start",
        flexDirection: "row"
    },
    boxRight: {
        height: "100%",
        alignItems: "center",
        justifyContent: "flex-end",
        flexDirection: "row"
    },
    boxCenter: {
        flex: 1,
        height: "100%",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row"
    },
    icon: {
        fontSize: scale(18),
        color: colors.icon.callNavigationBarIcon
    },
    iconWrapper: {
        paddingHorizontal: sizes.layout.spacing,
        height: "100%",
        alignItems: "center",
        justifyContent: "center"
    },
    message: {
        flex: 1,
        color: colors.text.sinkingNormal,
        fontSize: fontSizes.normal
    }
};

export default NavigationBar;