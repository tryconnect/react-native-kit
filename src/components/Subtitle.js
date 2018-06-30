"use strict";
import React from 'react';
import PropTypes from 'prop-types';
import { View, Text } from 'react-native';
import { fontSizes, colors, scale } from '~/configs/styles';

class Subtitle extends React.PureComponent {

    static displayName = "@Subtitle";

    static propTypes = {
        title: PropTypes.string
    };

    static defaultProps = {
        title:null
    };

    render() {
        
        const {
            title
        } = this.props;

        return (
            <View style={_styles.container}>
                <Text style={_styles.titleText}>{title}</Text>
            </View>
        );
    }

}

const _styles = {
    container:{
        paddingTop: 5 * scale,
        paddingBottom: 5 * scale,
        borderBottomWidth:1,
        borderColor: colors.pannelBorderColor
    },
    titleText:{
        fontWeight: 'bold',
        fontSize: fontSizes.normal,
        color: colors.textBoldColor
    }
};

export default Subtitle;