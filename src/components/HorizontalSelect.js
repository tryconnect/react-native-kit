"use strict";
import React from 'react';
import PropTypes from 'prop-types';
import { View, TouchableOpacity, Text } from 'react-native';
import { colors, scale, sizes, fontSizes } from '~/configs/styles';
import HorizontalItem from '~/components/HorizontalItem';

export default class HorizontalSelect extends React.Component {

    static displayName = "@HorizontalSelect";

    static propTypes = {
        style: PropTypes.oneOfType([ // css Khung
            PropTypes.object,
            PropTypes.number,
            PropTypes.string
            ]),
        itemStyle: PropTypes.oneOfType([ // css Item con
            PropTypes.object,
            PropTypes.number,
            PropTypes.string
            ]),
        activeStyle: PropTypes.oneOfType([ // css khi click vào icon con
            PropTypes.object,
            PropTypes.number,
            PropTypes.array
            ]),
        enable: PropTypes.bool,
        }

    constructor(props){
        super(props);
        this.state = {selectIndex : 0};
        this.enable = true;
    }

    selectFunction=(i)=>{  
        this.setState({
            selectIndex : i
        });
    }

    render() {
        const children = [
            {"value":1,"label":"Hồ Chí Minh"},
            {"value":2,"label":"Đà Nẵng"},
            {"value":3,"label":"Quy Nhơn"},
            {"value":4,"label":"Hà Nội"},
            {"value":5,"label":"Huế"},
        ]
        return (
            <View style={{flexDirection: 'row'}}>
                {children.map((r,i) => <HorizontalItem index={i} onPress={this.selectFunction.bind(this,i)} style_container={this.state.selectIndex === i ? [_styles.containerSelected] : [_styles.container]} style_btnLabel={[_styles.btnLabel]} label={r.label} key={i} value={r.value}></HorizontalItem>)}
            </View>
        );
    }
};

    


const _styles = {
    container: {
        flex:1,
        height: 30*scale,
        backgroundColor: colors.headerBackgroundColor,
        alignItems: "center",
        justifyContent: "center",
        borderBottomColor: colors.headerBackgroundColor,
        borderBottomWidth: 4,
    },

    containerSelected: {
        height: 30*scale,
        flex:1,
        backgroundColor: colors.headerBackgroundColor,
        alignItems: "center",
        justifyContent: "center",
        borderBottomColor: '#000',
        borderBottomWidth: 4
    },

    btnLabel: {
        color: 'white'
    }
};

