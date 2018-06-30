"use strict";
import React from 'react';
import PropTypes from 'prop-types';
import { View, TouchableOpacity, Text } from 'react-native';
import { colors, scale, sizes, fontSizes } from '~/configs/styles';
import Icon from 'react-native-vector-icons/Ionicons';

export default class Header extends React.Component {

    static displayName = "@Header";

    static propsType = {
        /* title: PropTypes.oneOfType([
            PropsTypes.string,
            PropTypes.element
        ]), */
        goBack: PropTypes.func,
        headerRight: PropTypes.node,
        headerLeft: PropTypes.node,
    }

    static defaultProps = {
        headerLeft: null,
        headerRight: null
    }

    constructor(props) {
        super(props);
    }

    render() {
        const {
            goBack,
            headerLeft,
            headerRight,
            title
        } = this.props;
        return (
            <View style={[_styles.container]}>
                {
                    !!goBack &&
                    <TouchableOpacity style={[_styles.touchIcon]}>
                        <Icon style={_styles.icon} name="ios-arrow-round-back" />
                    </TouchableOpacity>
                }
                {
                    !!headerLeft &&
                    <TouchableOpacity><Icon style={_styles.icon} name="ios-arrow-round-back" /></TouchableOpacity>
                }
                <View style={[_styles.title]}>
                    <Text style={[_styles.textStyle]}>{title}</Text>
                    {
                        !!headerRight &&
                        <TouchableOpacity>
                            <Icon style={_styles.icon} name="ios-arrow-round-back" />
                        </TouchableOpacity>
                    }
                </View>
            </View>
        );
    }
};




const _styles = {
    container: {
        borderWidth: 1 * scale,
        borderColor: colors.pannelBorderColor,
        borderRadius: 5 * scale,
        alignItems: "center",
        flexDirection: 'row',
    },
    touchIcon: {
        width: 40 * scale,
        height: 40 * scale,
        justifyContent: "center",
        alignItems: "center",
    },
    textStyle: {
        fontWeight: 'bold',
        fontSize: 15,
    },
    icon: {
        fontSize: 30,
        margin: 15 * scale
    },
    title: { flex: 1, flexDirection: 'row', justifyContent: "space-between" }
};

