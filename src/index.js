"use strict";
import React from 'react';
import PropTypes from 'prop-types';
import { View, Text } from 'react-native';

class Loader extends React.Component {

    static displayName = "@Loader";

    static propTypes = {
    };

    static defaultProps = {
    };

    state = {
    };

    constructor( props ) {
        super( props );

    }

    static getDerivedStateFromProps( nextProps, prevState ) {


        return null;
    };

    getSnapshotBeforeUpdate( nextProps, prevState ) {

    };

    shouldComponentUpdate( nextProps, nextState ) {
        
        return true;
    }

    render() {

        return (
            <View>
                <Text>34234234234</Text>
            </View>
        );
    }
    componentDidUpdate( nextProps, prevState, snapshot ) {
        
    }

}

const _styles = {
};

export default Loader;