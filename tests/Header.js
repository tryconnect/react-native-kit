import React from 'react';
import { View } from 'react-native';
import Header from '~/components/Header';
import Icon from 'react-native-vector-icons/Ionicons';
import TouchableOpacity from '~/components/TouchableOpacity';
class TestHeader extends React.Component {
    static displayName = "@TestHeader";

    render() {

        return (
            <View >
                <Header goBack title={"Hello World !!"}
                    headerLeft={<TouchableOpacity><Icon size={20} name="md-folder-open" ></Icon></TouchableOpacity>}
                    headerRight={
                        [
                            <TouchableOpacity><Icon size={20} name="ios-search"></Icon></TouchableOpacity>,
                            <TouchableOpacity><Icon size={20} name="md-folder-open"></Icon></TouchableOpacity>
                        ]
                    }
                >
                </Header>
            </View>
        );
    }

}

const _styles = {
};

export default TestHeader;

