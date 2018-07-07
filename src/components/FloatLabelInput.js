"use strict";
import React from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import Underline from '~/kit/Components/Underline';
import FloatingLabel from '~/kit/Components/FloatingLabel';
import TextInput from '~/components/TextInput';
import mergeStyle from '~/kit/Utilities/mergeStyle';
import { fontSizes, sizes, colors } from '~/configs/styles';

class FloatLabelInput extends React.Component {

    static displayName = "@FloatLabelInput";

    static propTypes = {
        style: PropTypes.object,
        onChangeText: PropTypes.func,
        onFocus: PropTypes.func,
        onBlur: PropTypes.func,
        onContentSizeChange: PropTypes.func,
        textColor: PropTypes.string,
        textFocusColor: PropTypes.string,
        textBlurColor: PropTypes.string,
        labelColor: PropTypes.string,
        highlightColor: PropTypes.string,
        borderColor: PropTypes.string,
        underlineColorAndroid: PropTypes.string,
        wrapperStyle: PropTypes.object,
        labelStyle: PropTypes.object,
        duration: PropTypes.number,
        // height: PropTypes.oneOfType([PropTypes.oneOf(undefined), PropTypes.number])
        label: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.element
        ]),
        value: PropTypes.string,
        dense: PropTypes.bool,

        multiline: PropTypes.bool,
        autoGrow: PropTypes.bool,
        onRef: PropTypes.func
    };

    static defaultProps = {
        textColor: colors.input.textColor,
        labelColor: colors.input.labelColor,
        textFocusColor: colors.input.textColor,
        textBlurColor: colors.input.textColor,
        highlightColor: colors.input.highlightColor,
        borderColor: colors.input.borderColor,
        underlineColorAndroid: 'rgba(0,0,0,0)',
        duration: 200,
        height: undefined,
        label: "",
        value: "",
        dense: true,

        multiline: false,
        autoGrow: false
    };

    constructor(props) {
        super(props);

        this.state = {
            isFocused: false,
            text: props.value || "",
            height: props.height
        };
    }

    static getDerivedStateFromProps(props, prevState) {

        if (props.value !== prevState.text) {

            return {
                isFocused: prevState.isFocused || false,
                text: props.value || ""
            };
        }
        return null;
    }

    focus = () => {

        return this.input.focus();
    };

    blur = () => {
        return this.input.blur();
    };

    isFocused = () => {

        return this.state.isFocused;
    };

    update = () => {

        return this.input.update();
    };

    clear = () => {

        return this.input.clear();
    };

    measureLayout = (...args) => {

        return this.refs.wrapper.measureLayout(...args);
    };

    measure = (...args) => {

        return this.refs.wrapper.measure(...args);
    };

    render() {

        const {
            style,
            onChangeText,
            onFocus,
            onBlur,
            onContentSizeChange,
            textColor,
            textFocusColor,
            textBlurColor,
            highlightColor,
            underlineColorAndroid,
            labelColor,
            borderColor,
            duration,
            height,

            label,
            value,
            dense,
            labelStyle,
            autoGrow,
            multiline,
            onRef,
            ...props
        } = this.props;

        let inputStyle = generateInputStyle(this.props, this.state);
        let wrapperStyle = generateWrapperStyle(this.props, this.state);

        let bottom = Math.round( sizes.layout.spacing );

        let labelHeight = Math.round(
            inputStyle.height 
            + fontSizes.small
        );

        return (
            <View 
                style = {wrapperStyle} 
                ref   = "wrapper"
            >
                <TextInput
                    {...props}
                    style               = {inputStyle}
                    onFocus             = {this._onFocus}
                    onBlur              = {this._onBlur}
                    onChangeText        = {this._onChangeText}
                    onContentSizeChange = {this._onContentSizeChange}
                    ref                 = {ref => {

                        this.input = ref;
                        onRef && onRef(ref);
                    }}
                    value               = {this.state.text}
                    multiline           = {multiline || autoGrow}
                />

                <Underline
                    ref            = "underline"
                    highlightColor = {highlightColor}
                    duration       = {duration}
                    borderColor    = {borderColor || underlineColorAndroid}
                />

                <FloatingLabel
                    ref            = "floatingLabel"
                    duration       = {duration}
                    label          = {label}
                    style          = {labelStyle}
                    isFocused      = {this.state.isFocused}
                    focusHandler   = {this.focus}
                    hasValue       = {!!this.state.text.length}
                    fontLarge      = {fontSizes.large}
                    fontSmall      = {fontSizes.small}
                    dense          = {dense}
                    height         = {labelHeight}
                    bottom         = {bottom}
                    labelColor     = {labelColor}
                    highlightColor = {highlightColor}
                />
            </View>
        );
    }

    componentDidMount() {
        
        if( this.state.text.length ) {

            this.refs.floatingLabel.floatLabel();
            this.refs.underline.expandLine();
        }

        let isFocused = this.input.isFocused();
        if (isFocused !== this.state.isFocused) {

            this.setState({
                isFocused
            });
        }
    }

    getSnapshotBeforeUpdate(prevProps, prevState) {

        if(
            this.state.text !== prevState.text
            || this.state.isFocused !== prevState.isFocused
        ) {

            return true;
        }
        return null;
    }

    componentDidUpdate(prevProps, prevState, snapshot) {

        if (snapshot) {

            let isFocused = this.input.isFocused();

            this.state.isFocused !== isFocused && this.setState({
                isFocused
            });
            if (
                isFocused || 
                (this.state.text && this.state.text.length)
            ) {

                this.refs.floatingLabel.floatLabel();
                this.refs.underline.expandLine();
            } else {

                this.refs.floatingLabel.sinkLabel();
                this.refs.underline.shrinkLine();
            }
        }
    }

    _onFocus = (e) => {

        this.setState({ 
            isFocused: true 
        });

        // this.refs.floatingLabel.floatLabel();
        // this.refs.underline.expandLine();
        this.props.onFocus && this.props.onFocus(e);
    };

    _onBlur = (e) => {

        this.setState({ 
            isFocused: false 
        });
        // !this.state.text.length && this.refs.floatingLabel.sinkLabel();
        // this.refs.underline.shrinkLine();
        this.props.onBlur && this.props.onBlur(e);
    };

    _onChangeText = (text = "") => {

        this.setState({ text });
        this.props.onChangeText && this.props.onChangeText(text);
    };

    _onContentSizeChange = (e) => {

        if (this.props.autoGrow) {
            let inputHeight = e.nativeEvent.contentSize.height;
            this.setState({
                height: inputHeight
            });
        }

        this.props.onContentSizeChange && this.props.onContentSizeChange(e);
    };
}

const _styles = {
    wrapper: {
        paddingTop: fontSizes.small + sizes.layout.spacing,
        position: 'relative'
    },
    textInput: {
        fontSize: fontSizes.normal,
        height: sizes.input.height,
        lineHeight: sizes.input.height,
        textAlignVertical: 'top'
    }
};

const generateInputStyle = (props = {}, state = {}) => {

    const {
        textColor,
        textFocusColor,
        textBlurColor,
        style,
        multiline,
        autoGrow
    } = props;

    const {
        isFocused,
        height
    } = state;

    let inputStyle = mergeStyle(
        {..._styles.textInput},
        {
            textAlignVertical: (multiline || autoGrow) ? 'top' : "center"
        },
        style
    );

    if (textColor) {

        inputStyle.color = textColor;
    }

    if (isFocused && textFocusColor) {

        inputStyle.color = textFocusColor;
    }

    if (!isFocused && textBlurColor) {

        inputStyle.color = textBlurColor;
    }

    if (height) {

        inputStyle.height = Math.max(height, inputStyle.height || 0);
    }

    return inputStyle;
};

const generateWrapperStyle = (props = {}) => {

    const {
        wrapperStyle
    } = props;

    let style = mergeStyle(
        {..._styles.wrapper},
        wrapperStyle
    );

    return style;
};

export default FloatLabelInput;