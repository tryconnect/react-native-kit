"use strict";
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Panel from '../src/components/Panel';

class TestPanel extends React.Component {
    static displayName = "@TestPanel";
    
    render() {

        return (
            <View style={{
                flex: 1,
                padding: 10
            }}>
                <Panel
                    header='Phuong tien van chuyen'
                    borderRadius={5}
                >
                    
                </Panel>
            </View>
        );
    }

}

const _styles = {
};

export default TestPanel;

