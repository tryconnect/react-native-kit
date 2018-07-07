"use strict";
import React from 'react';
// import PropTypes from 'prop-types';
import { Animated } from 'react-native';
import mergeStyle from '../Utilities/mergeStyle';

class FloatingLabel extends React.PureComponent {

    static displayName = "@FloatingLabel";

    // static propTypes = {
    //     duration: PropTypes.number,
    //     label: PropTypes.string.isRequired,
    //     style: PropTypes.object,
    //     isFocused: PropTypes.bool,
    //     focusHandler: PropTypes.func.isRequired,
    //     hasValue: PropTypes.bool,
    //     fontSmall: PropTypes.number.isRequired,
    //     fontLarge: PropTypes.number.isRequired,
    //     dense: PropTypes.bool,
    //     height: PropTypes.number.isRequired,
    //     bottom: PropTypes.number.isRequired,
    //     labelColor: PropTypes.string,
    //     highlightColor: PropTypes.string,
    //     children: PropTypes.string
    //     onRef: PropTypes.func
    // };

    static defaultProps = {
        duration: 200,
        hasValue: false,
        isFocused: false,
        label: "",
        fontSmall: 12,
        fontLarge: 16,
        dense: false,
        bottom: 15,
        height: 72
    };

    constructor(props) {
        super(props);

        if (props.dense) {
            
            let fontSize = Math.floor((props.fontSmall + props.fontLarge) / 2);
            this.fontLarge = fontSize;
            this.fontSmall = fontSize;
        } else {

            this.fontLarge = props.fontLarge;
            this.fontSmall = props.fontSmall;
        }

        let fontSize = (props.hasValue) ? this.fontSmall : this.fontLarge;
        let top = (props.hasValue) 
            ? props.height 
            : props.height - (props.bottom + this.fontLarge)
        ;

        this.state = {
            fontSize: new Animated.Value(fontSize),
            top: new Animated.Value(top)
        };
    }

    floatLabel = (callback) => {

        return Animated.parallel([
            Animated.timing(this.state.top, {
                toValue: 0,
                duration: this.props.duration
            }),
            Animated.timing(this.state.fontSize, {
                toValue: this.fontSmall,
                duration: this.props.duration
            })
        ]).start(callback);
    };

    sinkLabel = (callback) => {
        
        return Animated.parallel([
            Animated.timing(this.state.top, {
                toValue: this.props.height - (this.props.bottom + this.fontLarge),
                duration: this.props.duration
            }),
            Animated.timing(this.state.fontSize, {
                toValue: this.fontLarge,
                duration: this.props.duration
            })
        ]).start(callback);
    };

    render() {

        const {
            label,
            labelColor,
            highlightColor,
            style,
            focusHandler,
            isFocused,
            children,
            onRef,
            height,
            bottom,
            ...props
        } = this.props;

        let textStyle = mergeStyle(
            {
                left: 0,
                backgroundColor: 'rgba(0,0,0,0)',
                color: labelColor
            },
            style,
            {
                position: 'absolute'
            },
            labelColor && {
                color: labelColor
            },
            isFocused && highlightColor && {
                color: highlightColor
            },
            {
                fontSize: this.state.fontSize,
                top: this.state.top
            }
        );

        return (
            <Animated.Text
                {...props}
                style   = {textStyle}
                onPress = {focusHandler}
                ref     = {onRef}
            >
                {label || children}
            </Animated.Text>
        );
    }

    getSnapshotBeforeUpdate(prevProps, prevState) {

        if(
            this.props.dense !== prevProps.dense
            || this.props.fontSmall !== prevProps.fontSmall
            || this.props.fontLarge !== prevProps.fontLarge
        ) {

            if (this.props.dense) {

                let fontSize = Math.floor((this.props.fontSmall + this.props.fontLarge) / 2);
                this.fontLarge = fontSize;
                this.fontSmall = fontSize;
            } else {

                this.fontLarge = props.fontLarge;
                this.fontSmall = props.fontSmall;
            }
        }

        if( 
            this.props.height !== prevProps.height
            || this.props.isFocused !== prevProps.isFocused
            || this.props.hasValue !== prevProps.hasValue
            || this.props.dense !== prevProps.dense
            || this.props.fontSmall !== prevProps.fontSmall
            || this.props.fontLarge !== prevProps.fontLarge
            || this.props.bottom !== prevProps.bottom
        ) {

            if (this.props.hasValue || this.props.isFocused) {

                return "floatLabel";
            }
            return "sinkLabel";
        }
        return null;
    }

    componentDidUpdate(prevProps, prevState, snapshot) {

        if (snapshot) {

            this[snapshot]();
        }
    }
}

export default FloatingLabel;