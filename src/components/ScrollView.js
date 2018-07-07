"use strict";
import React from 'react';
import { ScrollView as BaseScrollView } from 'react-native';

class ScrollView extends React.PureComponent {

    static displayName = "@ScrollView";

    static defaultProp = {
        keyboardDismissMode: "interactive",
        keyboardShouldPersistTaps: "always"
    };

    render() {

        const {
            style,
            children,
            ...otherProps
        } = this.props;

        return (
            <BaseScrollView
                {...otherProps}
                style = {style || _styles.container}
            >
                {children}
            </BaseScrollView>
        );
    }
}

const _styles = {
    container: {
        flex: 1
    }
};

export default ScrollView;