"use strict";
import React from 'react';
import PropTypes from 'prop-types';
import { View, Text, Picker } from 'react-native';
import { colors, scale } from '~/configs/styles';

class Select extends React.Component {

    static displayName = "@Select";

    static propTypes = {
        error: PropTypes.bool,
        success: PropTypes.bool,
        warning: PropTypes.bool,
        children: PropTypes.oneOfType([
            PropTypes.object,
            PropTypes.array
        ]),
        onValueChange: PropTypes.func,
        enabled: PropTypes.bool,
    };

    static defaultProps = {
        error: false,
        success: false,
        warning: false,
        children: null,
        enabled: true,
        // mode: 'dropdown'
    };

    constructor(props) {
        super(props);
        this.state =
            {
                selected: props.selectedValue ? props.selectedValue : ''
            };
    }
    render() {

        const {
            error,
            success,
            warning,
            children,
            onValueChange,
            selectedValue,
            enabled,
            ...otherProps
        } = this.props;
        console.log(children);
        const items = Array.isArray(children) ? children : [children];

        return (
            <View style=
                {[
                    _styles.container,
                    !!error && _styles.error,
                    !!success && _styles.success,
                    !!warning && _styles.warning,
                ]}
            >
                <Picker
                    {...otherProps}
                    selectedValue={!!selectedValue && selectedValue}
                    onValueChange={onValueChange ? onValueChange : ((value) => this.setState({ selected: value }))}
                >
                    {
                        items.map((item) => {

                            const {
                                label,
                                value
                            } = item.props || {};
                            return (
                                <Picker.Item label={label} value={value} />
                            );
                        })
                    }
                </Picker>
            </View>
        );
    }
}

const _styles = {

    container: {
        borderWidth: 1 * scale,
        borderColor: colors.pannelBorderColor,
        borderRadius: 5 * scale,
        height: 40 * scale,
        backgroundColor: colors.inputBackgroundColor,
        margin: 10 * scale,
        justifyContent: 'center',
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

Select.Item = Picker.Item;

export default Select;