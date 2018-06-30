"use strict";
import React from 'react';
import { View, Animated, Platform, Keyboard } from 'react-native';
import ImageCache from '~/kit/Components/ImageCache';
import { scale, colors } from '~/configs/styles';

class SplashScreen extends React.PureComponent {

    static displayName = "@SplashScreen";

    constructor( props ) {
        super( props );

        this._height = new Animated.Value(1);
    }

    render() {

        let map = ["35%", "60%"];
        if (Platform.OS == "ios") {

            map = ["20%", "60%"];
        }

        let height = this._height.interpolate({
            inputRange: [0, 1],
            outputRange: map,
        });

        return (
            <ImageCache
                style        = {_styles.background}
                source       = {require("~/assets/images/background.png")}
                fadeDuration = {0}
                resizeMethod = "resize"
            >
                <Animated.View style={[_styles.logoBox, {
                    height: height
                }]}>
                    <ImageCache
                        style        = {_styles.logo}
                        source       = {require("~/assets/images/logo1.png")}
                        fadeDuration = {0}
                        resizeMethod = "resize"
                    />
                </Animated.View>
                <View style={_styles.contentBox}>
                    {
                        this.props.children
                    }
                </View>
            </ImageCache>
        );
    }

    scaleLogoTo = (toValue = 1) => {

        return Animated.timing(
            // Animate value over time
            this._height, // The value to drive
            {
                toValue, // Animate to final value of 1
                duration: 250,
                //useNativeDriver: true
            }
        ).start(); // Start the animation
    };

    componentDidMount() {

        this.keyboardWillShowListener = Keyboard.addListener('keyboardWillShow', () => {

            this.scaleLogoTo(0);
        });

        this.keyboardWillHideListener = Keyboard.addListener('keyboardWillHide', () => {

            this.scaleLogoTo(1);
        });
    }

    componentWillUnmount() {

        if (this._height) {

            this._height.removeAllListeners();
            this._height.stopAnimation();
            this._height.stopTracking();
        }

        this.keyboardWillShowListener && this.keyboardWillShowListener.remove();
        this.keyboardWillHideListener && this.keyboardWillHideListener.remove();
    }
}

const _styles = {
    background: {
        flex: 1,
        resizeMode: "cover",
        backgroundColor: colors.splashScreenBackgroundColor
    },
    logoBox: {
        height: "42%",
        justifyContent: "flex-end",
        alignItems: "center",
        paddingBottom: 40 * scale,
        paddingHorizontal: "10%"
    },
    logo: {
        height: "50%",
        width: "100%",
        resizeMode: "contain"
    },
    contentBox: {
        width: "100%",
        alignItems: "center",
        justifyContent: "flex-end",
        flex: 1
    }
};

export default SplashScreen;