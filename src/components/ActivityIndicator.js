"use strict";
import React from 'react';
import { ActivityIndicator as BaseActivityIndicator } from 'react-native';
import { colors } from '~/configs/styles';

class ActivityIndicator extends React.PureComponent {

    static displayName = "@ActivityIndicator";

    static propTypes = BaseActivityIndicator.propTypes;

    static defaultProps = {
        animating: true,
        color: colors.progress.activityIndicator,
        size: "large",
        hidesWhenStopped: true
    };

    render() {

        const {
            children,
            onRef,
            ...otherProps
        } = this.props;
        return (
            <BaseActivityIndicator
                {...otherProps}
                ref = {onRef}
            >
                {children}
            </BaseActivityIndicator>
        );
    }
}

export default ActivityIndicator;