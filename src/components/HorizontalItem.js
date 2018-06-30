"use strict";
import React from 'react';
import PropTypes from 'prop-types';
import { View, TouchableOpacity, Text,TouchableHighlight } from 'react-native';
import { colors, scale, sizes, fontSizes } from '~/configs/styles';

export default class HorizontalItem extends React.Component {

    static displayName = "@HorizontalItem";

    static propTypes = {
        label: PropTypes.string,
        value: PropTypes.any,
    }
        
    constructor(props){
        super(props);
    }

    render() {
        const {
            style_btnLabel,
            style_container,
            label,
            value,
            index,
            onPress,
        } = this.props;
        return (
            <TouchableHighlight style={style_container}>
                <Text style={style_btnLabel} onPress={onPress.bind(this,index)} value={value}>{label}</Text>
            </TouchableHighlight>
        );
    }
};

    


