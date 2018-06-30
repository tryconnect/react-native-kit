import React from 'react';
import { Easing, Animated } from 'react-native';
import { createStackNavigator } from 'react-navigation';
import {
    initialRouteParams,
    initialRouteName,
    routeConfiguration
} from '~/modules/index';

// config router
const navigatorConfiguration = {

    initialRouteName: initialRouteName,
    initialRouteParams: initialRouteParams,

    navigationOptions: {
        mode: "card",
        headerMode: "float",
        headerStyle: {
            height: 50,
            backgroundColor: "green"
        }
    },
    mode: "card",
    headerMode: "float",
    footerMode: "float",
    lazy: true
};

export default createStackNavigator(routeConfiguration, navigatorConfiguration);