"use strict";
import React from 'react';
import { TouchableOpacity as BaseTouchableOpacity } from 'react-native';
import { colors } from '~/configs/styles';

class TouchableOpacity extends React.PureComponent {

    static displayName = "@TouchableOpacity";

    static propTypes = BaseTouchableOpacity.propTypes;

    static defaultProps = {
        activeOpacity: colors.button.activeOpacity
    };

    render() {

        const {
            children,
            onRef,
            ...otherProps
        } = this.props;

        return (
            <BaseTouchableOpacity
                {...otherProps}
                ref = {onRef}
            >{children}</BaseTouchableOpacity>
        );
    }
}

export default TouchableOpacity;