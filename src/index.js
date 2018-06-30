"use strict";
import React from 'react';
import { View, Text } from 'react-native';
import SplashScreen from '~/components/SplashScreen';
import ProgressBar from '~/components/ProgressBar';
import { colors, fontSizes, scale } from '~/configs/styles';

class Loader extends React.Component {

    static displayName = "@Loader";

    constructor(props) {
        super(props);

        this.application = app();
        this.state = {
            description: "",
            prefix: "",
            current: 0,
            total: 0
        };
    }

    render() {

        return (
            <SplashScreen>
                <View style={_styles.container}>
                    <Text>dfsdf</Text>
                    <ProgressBar
                        progress      = {0}
                        style         = {_styles.progressBar}
                        color         = {colors.progressBarColor}
                        borderWidth   = {1}
                        indeterminate = {true}
                        height        = {4 * scale}
                        borderRadius  = {4 * scale}
                        borderColor   = {colors.progressBarBorderColor}
                    />
                </View>
            </SplashScreen>
        );
    }

    componentDidMount() {

        this._listenBootProgress = this.application.getBootProgess().addListener("process", (step) => {

            // console.log(step);
        });
    }

    componentWillUnmount() {

        this._listenBootProgress && this._listenBootProgress.remove();
    }
}

const _styles = {
    container: {
        width: "100%",
        padding: 40 * scale
    },
    progressBox: {
        flex: 1,
        width: "100%",
        paddingHorizontal: "10%",
        paddingBottom: "20%",
        justifyContent: "flex-end"
    },
    description: {
        color: colors.textSinkingColor,
        fontSize: fontSizes.small
    },
    descriptionPrefix: {
        color: colors.textSinkingColor,
        fontSize: fontSizes.small,
        fontWeight: "bold"
    },
    progressBar: {
        marginTop: 3 * scale
    }
};

export default Loader;