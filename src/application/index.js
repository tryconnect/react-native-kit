"use strict";
import React from 'react';
import PropTypes from 'prop-types';
import { View, Text } from 'react-native';
import Navigator from '~/navigators/Home.nav';

class Application extends React.Component {

    static displayName = "@Application";

    render() {

        return (
            <Navigator />
        );
    }

    componentDidMount() {

    }
}

const _styles = {
};

export default Application;