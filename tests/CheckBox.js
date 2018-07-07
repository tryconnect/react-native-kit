import React from 'react';
import { View } from 'react-native';
import CheckBox from '~/components/CheckBox';

class TestCheckBox extends React.Component {
    static displayName = "@TestCheckBox";

    render() {

        return (
            <View style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center"
            }}>
                <CheckBox
                    // disabled={true}
                    style={{
                        width: 50,
                        height: 50
                    }}
                >
                </CheckBox>
            </View>
        );
    }

}

const _styles = {
};

export default TestCheckBox;

