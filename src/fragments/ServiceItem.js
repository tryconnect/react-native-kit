"use strict";
import React from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import { colors, sizes, scale } from '../configs/styles';
import Icon from 'react-native-vector-icons/FontAwesome';
import TouchableOpacity from '~/components/TouchableOpacity';
import Text from '~/components/Text';

export default class ServiceItem extends React.Component {

    static displayName = "@ServiceItem";

    static propTypes = {
        icon: PropTypes.string,
        name: PropTypes.string,
        label: PropTypes.string,
        actived: PropTypes.bool,
        disabled: PropTypes.bool,
        onActiveChange: PropTypes.func
    }

    static defaultProps = {
        actived: false,
        disable: false
    }

    constructor(props) {
        super(props);
        this.state = {
            actived: this.props.actived
        }
    }

    onActiveChange = () => {
        this.setState({
            actived: !this.state.actived
        })
    }

    render() {
        const {
            icon,
            name,
            label,
            actived,
            disabled,
        } = this.props;
        return (
            <View style={
                !!this.state.actived
                    ? [_styles.contentActived, _styles.containerSize]
                    : [_styles.containerSize]
            }>
                <TouchableOpacity onPress={this.onActiveChange.bind()} activeOpacity={1}>
                    <View style={
                        !!this.state.actived
                            ? [_styles.upperActived, _styles.upperContentSize]
                            : [_styles.upperContent, _styles.upperContentSize]
                    }
                    >
                        {
                            !!icon
                                ? <View style={[_styles.iconStyle]}>{icon}</View>
                                : <Icon name="balance-scale" size={sizes.layout.iconServiceItem} style={[_styles.iconStyle]} /> // default icon
                        }
                        <Text style={[_styles.textStyle]}>{name.toUpperCase()}</Text>
                    </View>
                    <View style={[_styles.lowerContent]} >
                        <Text style={[_styles.textStyle]}>{label.toUpperCase()}</Text>
                    </View>
                </TouchableOpacity>
            </View>
        );
    }
}
const _styles = {
    containerSize: {
        width: scale(150),
        height: scale(120),
    },

    upperContentSize: {
        width: scale(150),
        height: scale(100),
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center"
    },

    upperContent: {
        backgroundColor: colors.panel.serviceItemBackgroundColor,
    },
    upperActived: {
        backgroundColor: colors.panel.serviceItemActivedBackgroundColor,
    },
    lowerContent: {
        width: scale(150),
        height: scale(20),
        backgroundColor: colors.panel.serviceItemPriceBackgroundColor,
        textAlign: 'center'
    },
    textStyle: {
        color: colors.text.ServiceItem,
        textAlign: 'center',
    },
    iconStyle: {
        marginBottom: 10
    },
    contentActived: {
        borderWidth: 1,
        borderColor: '#2222227d',
    }
};
