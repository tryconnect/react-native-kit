"use strict";
import React from 'react';
import PropTypes from 'prop-types';
import Ripple from '~/kit/Components/Ripple';
import TouchableOpacity from '~/components/TouchableOpacity';
import ActivityIndicator from '~/components/ActivityIndicator';
import Text from '~/components/Text';
import mergeStyle from '~/kit/Utilities/mergeStyle';
import { colors, sizes } from '~/configs/styles';

class Button extends React.PureComponent {

    static displayName = "@Button";

    static propTypes = {
        disabled: PropTypes.bool,
        raised: PropTypes.bool, // hiệu ứng click
        loading: PropTypes.bool, // loading
        onRef: PropTypes.func
    };

    static defaultProps = {
        disabled: false,
        raised: true,
        loading: false,
        rippleColor: colors.button.rippleColor,
        rippleOpacity: colors.button.rippleOpacity,
        loadingSize: "small"
    };

    render() {

        const {
            raised,
            children,
            loading,
            rippleColor,
            rippleOpacity,
            rippleDuration,
            rippleSize,
            rippleContainerBorderRadius,
            rippleCentered,
            rippleSequential,
            rippleFades,
            onRippleAnimation,
            loadingAnimating,
            loadingColor,
            loadingSize,
            loadingHidesWhenStopped,
            loadingStyle,
            style,
            disabled,
            onRef,
            ...otherProps
        } = this.props;

        if (raised) {

            return (
                <Ripple
                    {...otherProps}
                    style                       = {mergeStyle(_styles.container, style)}
                    rippleContainerBorderRadius = {rippleContainerBorderRadius}
                    rippleColor                 = {rippleColor}
                    rippleOpacity               = {rippleOpacity}
                    rippleDuration              = {rippleDuration}
                    rippleSize                  = {rippleSize}
                    rippleCentered              = {rippleCentered}
                    rippleSequential            = {rippleSequential}
                    rippleFades                 = {rippleFades}
                    onRippleAnimation           = {onRippleAnimation}
                    disabled                    = {loading || disabled}
                    onRef                       = {onRef}
                >
                    {
                        !!loading &&
                            <ActivityIndicator 
                                animating        = {loadingAnimating}
                                color            = {loadingColor}
                                size             = {loadingSize}
                                hidesWhenStopped = {loadingHidesWhenStopped}
                                style            = {mergeStyle(_styles.loading, loadingStyle)}
                            />
                    }
                    {
                        typeof children === "string" ?
                            <Text>{children}</Text>
                        : children
                    }
                </Ripple>
            );
        }

        return (
            <TouchableOpacity
                {...otherProps}
                style    = {mergeStyle(_styles.container, style)}
                disabled = {loading || disabled}
                onRef    = {onRef}
            >
                {
                    !!loading &&
                        <ActivityIndicator
                            animating        = {loadingAnimating}
                            color            = {loadingColor}
                            size             = {loadingSize}
                            hidesWhenStopped = {loadingHidesWhenStopped}
                            style            = {mergeStyle(_styles.loading, loadingStyle)}
                        />
                }
                {
                    typeof children === "string" ?
                        <Text>{children}</Text>
                    : children
                }
            </TouchableOpacity>
        );
    }
}

const _styles = {
    container: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center"
    },
    loading: {
        marginRight: sizes.layout.spacing,
        marginLeft: -sizes.layout.spacing
    }
};

export default Button;