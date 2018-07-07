import React from 'react';
import { View } from 'react-native';
import Rating from '~/components/Rating';

class TestRating extends React.Component {
    static displayName = "@TestRating";

    render() {

        return (
            <View style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center"
            }}>
                <Rating
                    style={{
                        width: 300
                    }}
                    iconStyle={{
                        fontSize: 30
                    }}
                >
                </Rating>
            </View>
        );
    }

}

const _styles = {
};

export default TestRating;

