"use strict";
import React from 'react';
import PropTypes from 'prop-types';
import { View, Text, TouchableOpacity } from 'react-native';

class Home extends React.Component {

    static displayName = "@Home";

    render() {

        console.log(this.props);
        return (
            <View>
                <Text>Home</Text>
                <TouchableOpacity onPress={() => {
                    
                    this.props.navigation.navigate("/profile");
                }}>
                    <Text>Profile</Text>
                </TouchableOpacity>
            </View>
        );
    }
}

const _styles = {
};

export default Home;