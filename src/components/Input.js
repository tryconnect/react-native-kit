import React from 'react';
import PropTypes from 'prop-types';
import { TextInput } from 'react-native';
import { colors, scale } from '~/configs/styles';

class Input extends React.PureComponent {

    static displayName = "@Input";

    static propTypes = {
        error: PropTypes.bool,
        success: PropTypes.bool,
        warning: PropTypes.bool,
    };

    static defaultProps = {
        error: false,
        success: false,
        warning: false,
    };

    render() {

        const {
            style,
            error,
            success,
            warning,
            ...otherProps
        } = this.props;

        return (
            <TextInput
                underlineColorAndroid='transparent'
                placeholderTextColor={colors.placeholderTextColor}
                {...otherProps}
                style={[
                    _styles.input,
                    style,
                    !!error && _styles.error,
                    !!success && _styles.success,
                    !!warning && _styles.warning,
                ]}
            />
        );

    }

}

const _styles = {
    input: {
        borderWidth: 1 * scale,
        borderColor: colors.pannelBorderColor,
        borderRadius: 5 * scale,
        height: 40 * scale,
        // paddingLeft: 10 * scale,
        backgroundColor: colors.inputBackgroundColor,
        // margin: 10 * scale,
    },
    error: {
        borderColor: colors.inputErrorBorderColor,
    },
    success: {
        borderColor: colors.inputSuccessBorderColor,
    },
    warning: {
        borderColor: colors.inputWarningBorderColor,
    }
};

export default Input;