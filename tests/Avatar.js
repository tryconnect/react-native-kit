import React from 'react';
import { View } from 'react-native';
import Avatar from '~/components/Avatar';

class TestAvatar extends React.Component {
    static displayName = "@TestAvatar";

    render() {

        return (
            <View style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center"
            }}>
                <Avatar
                    // source='https://reactnativecode.com/wp-content/uploads/2018/01/Error_Img.png'
                    onlineStatus={true}
                >
                </Avatar>
            </View>
        );
    }

}

const _styles = {
};

export default TestAvatar;

