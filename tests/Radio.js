"use strict";
import React from 'react';
import { View } from 'react-native';
import Radio from '../src/components/Radio';

class TestRadio extends React.Component {
    static displayName = "@TestRadio";

    render() {

        return (
            <View style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center"
            }}>
                <Radio
                    size={50}
                >
                </Radio>
            </View>
        );
    }

}

const _styles = {
};

export default TestRadio;

