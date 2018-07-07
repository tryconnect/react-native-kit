"use strict";
import React from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import Text from '~/components/Text';
import TouchableOpacity from '~/components/TouchableOpacity';
import { scale, colors, sizes, fontSizes } from '~/configs/styles';
import Icon from 'react-native-vector-icons/Ionicons';
import mergeStyle from '~/kit/Utilities/mergeStyle';

export default class Header extends React.Component {

    static displayName = "@Header";

    static propTypes = {
        title: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.element
        ]),
        goBack: PropTypes.func,
        headerLeft: PropTypes.node,
        headerRight: PropTypes.node,
    };

    static defaultProps = {
        headerLeft: null,
        headerRight: null,
    };

    state = {
    };

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
                <View style={[_styles.leftItem]}>
                    {
                        !!goBack &&
                        <TouchableOpacity>
                            <Icon size={20} name="ios-arrow-back" />
                        </TouchableOpacity>
                    }
                    {
                        !!headerLeft &&
                        headerLeft
                    }
                </View>
                {
                    <Text style={[_styles.textStyle]}>{title.toUpperCase()}</Text>
                }
                {
                    !!headerRight &&
                    <View style={[_styles.rightItem]}>
                        {headerRight}
                    </View>
                }
            </View>
        );
    }
    componentDidUpdate(nextProps, prevState, snapshot) {

    }

}

const _styles = {
    container: {
        height: scale(30),
        borderBottomWidth: sizes.border.rowItemBorderBottom,
        borderBottomColor: colors.border.rowItemBorderBottomColor,
        justifyContent: 'space-between',
        flexDirection: 'row',
        alignItems: 'center'
    },
    textStyle: {
        fontSize: fontSizes.normal,
        color: colors.text.title,
        fontWeight: 'bold'
    },
    leftItem: {
        justifyContent: 'space-between',
        flex: 0.15,
        marginLeft: 10,
        flexDirection: 'row'
    },
    rightItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        flex: 0.15,
        marginRight: 10
    }
};
