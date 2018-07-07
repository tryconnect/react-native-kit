import React from 'react';
import PropTypes from 'prop-types';
import shallowEqual from 'fbjs/lib/shallowEqual';
import Icon from 'react-native-vector-icons/FontAwesome';
import TouchableOpacity from '~/components/TouchableOpacity'
import { sizes, colors, scale } from '~/configs/styles';
import mergeStyle from '~/kit/Utilities/mergeStyle';

class CheckBox extends React.Component {

    static displayName = "@CheckBox";

    static propTypes = {
        disabled: PropTypes.bool,
        value: PropTypes.bool,
        onValueChange: PropTypes.func
    };

    static defaultProp = {
        disabled: false,
        value: false
    };

    constructor(props) {
        super(props);

        this.state = {
            checked: props.value
        };
    }

    static getDerivedStateFromProps(props, prevState) {

        if (props.value !== prevState.checked) {

            return {
                checked: props.value
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
            ...otherProps
        } = this.props;

        const containerStyle = mergeStyle(
            _styles.container,
            style
        );

        const size = ((containerStyle.width + containerStyle.height) / 2) * 2 / 3;

        return (
            <TouchableOpacity
                {...otherProps}
                onPress            = {this._onValueChange}
                style              = {[containerStyle, {
                    backgroundColor: this.state.checked ? colors.input.checkedColor: colors.input.backgroundColor
                }]}
                disabled           = {disabled}
            >
                {
                    !!this.state.checked &&
                        <Icon name="check" style={{
                            fontSize: size,
                            color: colors.input.backgroundColor
                        }} />
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

            return onValueChange(!this.state.checked);
        }

        this.setState({
            checked: !this.state.checked
        });
    }
}

const _styles = {
    container: {
        width: scale(20),
        height: scale(20),
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: sizes.input.borderWidth,
        borderColor: colors.input.borderColor
    }
};

export default CheckBox;