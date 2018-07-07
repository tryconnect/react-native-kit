"use strict";
import React from 'react';
import { View, Text } from 'react-native';
import RowItem from '../src/components/RowItem';
import Icon from 'react-native-vector-icons/FontAwesome';
import Avatar from '~/components/Avatar';

class TestRowItem extends React.Component {
    static displayName = "@TestRowItem";

    render() {

        return (
            <View style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center"
            }}>
                <RowItem 
                    avatar={
                        <Avatar />
                    }
                >
                    <Text>sdfsdfsdf</Text>
                </RowItem>
            </View>
        );
    }

}

const _styles = {
};

export default TestRowItem;

