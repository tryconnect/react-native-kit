"use strict";
import React from 'react';
import PropTypes from 'prop-types';
import { View, Text, TouchableOpacity } from 'react-native';

class Profile extends React.Component {

    static displayName = "@Profile";

    render() {

        return (
            <View>
                <Text>Profile</Text>
                <TouchableOpacity onPress={() => {
                    this.props.navigation.goBack();
                }}>
                    <Text>back</Text>
                </TouchableOpacity>
            </View>
        );
    }
}

const _styles = {
};

export default Profile;