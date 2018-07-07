"use strict";
import React from 'react';
import { Text as BaseText } from 'react-native';
import mergeStyle from '~/kit/Utilities/mergeStyle';
import { fontSizes, colors } from '~/configs/styles';

class Text extends React.PureComponent {

    static displayName = "@Text";

    static propTypes = BaseText.propTypes;

    static defaultProps = BaseText.defaultProps;

    render() {

        const {
            children,
            style,
            onRef,
            ...otherProps
        } = this.props;
        return (
            <BaseText
                {...otherProps}
                style = {mergeStyle(_style, style)}
                ref   = {onRef}
            >{children}</BaseText>
        );
    }
}

const _style = {
    fontSize: fontSizes.normal,
    color: colors.text.normal
};

export default Text;