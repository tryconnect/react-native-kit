"use strict";
import React from 'react';
import { TextInput as BaseTextInput } from 'react-native';
import { colors, fontSizes } from '~/configs/styles';
import mergeStyle from '~/kit/Utilities/mergeStyle';

class TextInput extends React.PureComponent {

    static displayName = "@TextInput";

    static propTypes = BaseTextInput.propTypes;

    static defaultProps = {
        placeholderTextColor: colors.input.placeholder,
        selectionColor: colors.input.selectionColor,
        underlineColorAndroid: colors.input.underlineColorAndroid
    };

    focus = () => {

        return this.input.focus();
    };

    blur = () => {

        return this.input.blur();
    };

    update = () => {

        return this.input.update();
    };

    clear = () => {

        return this.input.clear();
    };

    isFocused = () => {

        return this.input.isFocused();
    };

    measure = (...args) => {

        return this.input.measure(...args);
    };

    measureLayout = (...args) => {

        this.input.measureLayout(...args)
    };

    render() {

        const {
            children,
            style,
            onRef,
            ...otherProps
        } = this.props;

        return (
            <BaseTextInput
                {...otherProps}
                style          = {mergeStyle(_style, style)}
                ref            = {ref => {
                    this.input = ref;
                    onRef && onRef(ref);
                }}
            >
                {children}
            </BaseTextInput>
        );
    }
}

const _style = {
    fontSize: fontSizes.normal,
    color: colors.input.textColor,
    margin: 0,
    padding: 0
};

export default TextInput;