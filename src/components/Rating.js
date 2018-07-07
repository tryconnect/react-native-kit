import React from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import TouchableOpacity from '~/components/TouchableOpacity'
import { colors, scale } from '~/configs/styles';
import shallowEqual from 'fbjs/lib/shallowEqual';
import mergeStyle from '~/kit/Utilities/mergeStyle';

class Rating extends React.Component {

    static displayName = "@Rating";

    static propTypes = {
        value: PropTypes.number,
        disabled: PropTypes.bool,
        onValueChange: PropTypes.func,
        iconStyle: PropTypes.oneOfType([
            PropTypes.object,
            PropTypes.number,
            PropTypes.array
        ]),
        iconActiveStyle: PropTypes.oneOfType([
            PropTypes.object,
            PropTypes.number,
            PropTypes.array
        ]),
        iconUnActiveStyle: PropTypes.oneOfType([
            PropTypes.object,
            PropTypes.number,
            PropTypes.array
        ])
    };

    static defaultProp = {
        disabled: false,
        value: 0
    };

    constructor(props) {
        super(props);

        this.state = {
            star: props.value
        };
    }

    static getDerivedStateFromProps(props, prevState) {

        if (props.value !== prevState.star) {

            return {
                star: props.value
            };
        }
        return null;
    }

    shouldComponentUpdate(nextProps, nextState) {

        return (
            !shallowEqual(this.state, nextState)
            || !shallowEqual(this.props, nextProps)
        );
    }

    render() {

        const {
            disabled,
            onValueChange,
            onPress,
            iconActiveStyle,
            iconUnActiveStyle,
            iconStyle,
            style,
            ...otherProps
        } = this.props;

        const active = mergeStyle(_styles.icon, iconStyle, _styles.active, iconActiveStyle);
        const unActive = mergeStyle(_styles.icon, iconStyle, _styles.unActive, iconActiveStyle);

        return (
            <View 
                {...otherProps}
                style = {mergeStyle(_styles.container, style)}
            >
                <TouchableOpacity
                    onPress  = {(e) => {

                        onPress && onPress(e);
                        this.rating(1);
                    }}
                    disabled = {disabled}
                >
                    <Icon 
                        style = {this.state.star >= 1 ? active: unActive}
                        name  = "star"
                    />
                </TouchableOpacity>
                <TouchableOpacity
                    onPress  = {(e) => {

                        onPress && onPress(e);
                        this.rating(2);
                    }}
                    disabled = {disabled}
                >
                    <Icon 
                        style = {this.state.star >= 2 ? active: unActive}
                        name  = "star"
                    />
                </TouchableOpacity>
                <TouchableOpacity
                    onPress  = {(e) => {

                        onPress && onPress(e);
                        this.rating(3);
                    }}
                    disabled = {disabled}
                >
                    <Icon
                        style = {this.state.star >= 3 ? active: unActive}
                        name  = "star"
                    />
                </TouchableOpacity>
                <TouchableOpacity
                    onPress  = {(e) => {

                        onPress && onPress(e);
                        this.rating(4);
                    }}
                    disabled = {disabled}
                >
                    <Icon
                        style = {this.state.star >= 4 ? active: unActive}
                        name  = "star"
                    />
                </TouchableOpacity>
                <TouchableOpacity
                    onPress  = {(e) => {

                        onPress && onPress(e);
                        this.rating(5);
                    }}
                    disabled = {disabled}
                >
                    <Icon
                        style = {this.state.star >= 5 ? active: unActive}
                        name  = "star"
                    />
                </TouchableOpacity>
            </View>
        );
    }

    rating = (point) => {

        const {
            onValueChange
        } = this.props;

        if (onValueChange) {

            return onValueChange(point);
        }

        this.setState({
            star: point
        });
    };
}

const _styles = {
    container: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: scale(100)
    },
    icon: {
        color: colors.input.activeColor,
        fontSize: scale(18)
    },
    active: {
        color: colors.input.activeColor
    },
    unActive: {
        color: colors.input.inactiveColor
    }
};

export default Rating;