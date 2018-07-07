import React from 'react';
// import PropTypes from 'prop-types';
import { View, Animated, Easing, TouchableWithoutFeedback, StyleSheet } from 'react-native';

class Ripple extends React.Component {

    static propTypes = {
        ...Animated.View.propTypes,
        ...TouchableWithoutFeedback.propTypes,

        // rippleColor: PropTypes.string,
        // rippleOpacity: PropTypes.number,
        // rippleDuration: PropTypes.number,
        // rippleSize: PropTypes.number,
        // rippleContainerBorderRadius: PropTypes.number,
        // rippleCentered: PropTypes.bool,
        // rippleSequential: PropTypes.bool,
        // rippleFades: PropTypes.bool,
        // disabled: PropTypes.bool,

        // onRippleAnimation: PropTypes.func,
        // onRef: PropTypes.func
    };

    static defaultProps = {
        ...TouchableWithoutFeedback.defaultProps,
        rippleColor: 'rgb(0, 0, 0)',
        rippleOpacity: 0.30,
        rippleDuration: 400,
        rippleSize: 0,
        rippleContainerBorderRadius: 0,
        rippleCentered: false,
        rippleSequential: false,
        rippleFades: true,
        disabled: false,
        onRippleAnimation: (animation, callback) => animation.start(callback),
    };

    constructor(props) {
        super(props);

        this.unique = 0;
        this.mounted = false;

        this.state = {
            width: 0,
            height: 0,
            ripples: []
        };
    }

    render() {

        const { onPress, onPressIn, onPressOut, onLongPress, onLayout } = this;

        const {
            delayLongPress,
            delayPressIn,
            delayPressOut,
            disabled,
            hitSlop,
            pressRetentionOffset,
            children,
            rippleContainerBorderRadius,
            testID,
            nativeID,
            accessible,
            accessibilityLabel,
            onLayout: __ignored__,
            onRef,
            ...props
        } = this.props;

        const touchableProps = {
            delayLongPress,
            delayPressIn,
            delayPressOut,
            disabled,
            hitSlop,
            pressRetentionOffset,
            onPress,
            onPressIn,
            testID,
            nativeID,
            accessible,
            accessibilityLabel,
            onPressOut,
            onLongPress: props.onLongPress ? onLongPress : undefined,
            onLayout
        };

        const containerStyle = {
            borderRadius: rippleContainerBorderRadius
        };

        return (
            <TouchableWithoutFeedback {...touchableProps}>
                <Animated.View 
                    {...props} 
                    pointerEvents = 'box-only'
                    ref           = {onRef}
                >
                    {children}
                    <View style={[_styles.container, containerStyle]}>
                        {
                            this.state.ripples.map(this.renderRipple)
                        }
                    </View>
                </Animated.View>
            </TouchableWithoutFeedback>
        );
    }

    componentDidMount() {

        this.mounted = true;
    }

    componentWillUnmount() {

        this.mounted = false;
    }

    renderRipple = ({ unique, progress, locationX, locationY, R }) => {

        const { rippleColor, rippleOpacity, rippleFades } = this.props;

        const rippleStyle = {
            top: locationY - radius,
            left: locationX - radius,
            backgroundColor: rippleColor,

            transform: [{
                scale: progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.5 / radius, R / radius],
                })
            }],

            opacity: rippleFades ?
                progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [rippleOpacity, 0],
                }) :
                rippleOpacity
        };

        return (
            <Animated.View 
                style = {[_styles.ripple, rippleStyle]} 
                key   = {unique} 
            />
        );
    };

    onLayout = (event) => {

        const { width, height } = event.nativeEvent.layout;
        const { onLayout } = this.props;

        if ('function' === typeof onLayout) {
            onLayout(event);
        }

        this.setState({ width, height });
    };

    onPress = (event) => {
        const { ripples } = this.state;
        const { onPress, rippleSequential } = this.props;

        if (!rippleSequential || !ripples.length) {
            if ('function' === typeof onPress) {
                requestAnimationFrame(() => onPress(event));
            }

            this.startRipple(event);
        }
    };

    onLongPress = (event) => {
        const { onLongPress } = this.props;

        if ('function' === typeof onLongPress) {
            requestAnimationFrame(() => onLongPress(event));
        }

        this.startRipple(event);
    };

    onPressIn = (event) => {
        const { onPressIn } = this.props;

        if ('function' === typeof onPressIn) {
            onPressIn(event);
        }
    };

    onPressOut = (event) => {
        const { onPressOut } = this.props;

        if ('function' === typeof onPressOut) {
            onPressOut(event);
        }
    };

    onAnimationEnd = () => {
        if (this.mounted) {
            this.setState(({ ripples }) => ({ ripples: ripples.slice(1) }));
        }
    };

    startRipple = (event) => {

        const { width, height } = this.state;
        const {
            rippleDuration,
            rippleCentered,
            rippleSize,
            onRippleAnimation,
        } = this.props;

        const w2 = 0.5 * width;
        const h2 = 0.5 * height;

        const { locationX, locationY } = rippleCentered ?
            { locationX: w2, locationY: h2 } :
            event.nativeEvent;

        const offsetX = Math.abs(w2 - locationX);
        const offsetY = Math.abs(h2 - locationY);

        const R = rippleSize > 0 ?
            0.5 * rippleSize :
            Math.sqrt(Math.pow(w2 + offsetX, 2) + Math.pow(h2 + offsetY, 2));

        const ripple = {
            unique: this.unique++,
            progress: new Animated.Value(0),
            locationX,
            locationY,
            R
        };

        let animation = Animated
            .timing(ripple.progress, {
                toValue: 1,
                easing: Easing.out(Easing.ease),
                duration: rippleDuration,
                useNativeDriver: true
            })
        ;

        onRippleAnimation(animation, this.onAnimationEnd);

        this.setState(({ ripples }) => ({ ripples: ripples.concat(ripple) }));
    };
}

const radius = 10;

const _styles = {
    container: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'transparent',
        overflow: 'hidden',
    },
    ripple: {
        width: radius * 2,
        height: radius * 2,
        borderRadius: radius,
        overflow: 'hidden',
        position: 'absolute'
    }
};

export default Ripple;