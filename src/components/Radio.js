"use strict";
import React from 'react';
import PropTypes from 'prop-types';
import Icon from 'react-native-vector-icons/FontAwesome';
import TouchableOpacity from '~/components/TouchableOpacity';
import shallowEqual from 'fbjs/lib/shallowEqual';
import { colors, sizes } from '~/configs/styles';
import mergeStyle from '~/kit/Utilities/mergeStyle';

class Radio extends React.Component {

    static displayName = "@Radio";

    static propTypes = {
        onValueChange: PropTypes.func,
        value: PropTypes.bool,
        disabled: PropTypes.bool,
        size: PropTypes.number
    };

    static defaultProps = {
        disabled: false,
        value: false,
        size: sizes.input.radioSize
    };

    constructor(props) {
        super(props);

        this.state = {
            value: props.value
        };
    }

    static getDerivedStateFromProps(props, prevState) {

        if (props.value !== prevState.value) {

            return {
                value: props.value
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
            style,
            onValueChange,
            value,
            disabled,
            size,
            ...otherProps
        } = this.props;

        const containerStyle = mergeStyle(
            _styles.container,
            style
        );

        const _size = size || Math.min(containerStyle.height || 0, containerStyle.width || 0);

        return (
            <TouchableOpacity 
                {...otherProps}
                onPress  = {this._onValueChange} 
                style    = {[containerStyle, {
                    width: _size,
                    height: _size,
                    borderRadius: _size / 2,
                    backgroundColor: this.state.value ? colors.input.checkedColor : colors.input.backgroundColor
                }]}
                disabled = {disabled}
            >
                {
                    !!this.state.value &&
                        <Icon name="check" style={{
                            fontSize: _size * 2 / 3,
                            color: colors.input.backgroundColor
                        }}/>
                }
            </TouchableOpacity>
        );
    }

    _onValueChange = (e) => {

        const {
            onValueChange,
            onPress
        } = this.props;
        onPress && onPress(e);
        
        if (onValueChange) {

            return onValueChange(!this.state.value);
        }

        this.setState({
            value: !this.state.value
        });
    };
}

const _styles = {
    container: {
        width: sizes.input.radioSize,
        height: sizes.input.radioSize,
        borderRadius: sizes.input.radioSize / 2,
        borderWidth: sizes.input.radioBorder,
        borderColor: colors.input.borderColor,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.input.backgroundColor
    }
};

export default Radio;