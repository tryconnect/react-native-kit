"use strict";
import React from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import { colors, scale, sizes } from '~/configs/styles';
import Icon from 'react-native-vector-icons/FontAwesome';
import TouchableOpacity from '~/components/TouchableOpacity';
import Text from '~/components/Text';

class RowItem extends React.Component {

    static displayName = "@RowItem";

    static propsType = {
        chilrden: PropTypes.oneOfType([
            PropTypes.node,
            PropTypes.string
        ]),
        avatar: PropTypes.element
    };

    static defaultProps = {
        children: null,
        avatar: null
    };

    render() {

        const {
            style,
            children,
            avatar,
            ...otherProps
        } = this.props;

        return (
            <TouchableOpacity 
                {...otherProps}
                style = {[_styles.wrapper, style]}
            >
                {
                    !!avatar && 
                        <View style={_styles.avatar}>
                            { avatar }
                        </View>
                }
                <View style={_styles.container}>
                    {
                        typeof children === "string" ?
                            <Text>{children}</Text>
                        : children
                    }
                </View>
                <Icon 
                    name  = "chevron-right" 
                    style = {_styles.iconStyle}
                />
            </TouchableOpacity>
        );
    }
};

const _styles = {
    wrapper: {
        borderBottomWidth: sizes.border.rowItemBorderBottom,
        borderBottomColor: colors.border.rowItemBorderBottomColor,
        alignItems: "center",
        justifyContent: "space-between",
        flexDirection: 'row',
        paddingHorizontal: sizes.layout.margin,
        paddingVertical: sizes.layout.spacing,
        width: "100%"
    },
    avatar: {
        marginRight: sizes.layout.spacing
    },
    container: {
        flex: 1
    },
    iconStyle: {
        marginLeft: sizes.layout.spacing,
        fontSize: scale(15)
    }
};

export default RowItem;