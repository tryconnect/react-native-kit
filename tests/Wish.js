"use strict";
import React from 'react';
import { View } from 'react-native';
import WishButton from '../src/components/WishButton';

class TestWishButton extends React.Component {
    static displayName = "@TestWishButton";

    render() {

        return (
            <View style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center"
            }}>
                <WishButton>
                </WishButton>
            </View>
        );
    }

}

const _styles = {
};

export default TestWishButton;

