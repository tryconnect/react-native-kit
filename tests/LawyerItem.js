import React from 'react';
import { View } from 'react-native';
import LawyerItem from '~/fragments/LawyerItem';

class TestLawyerItem extends React.Component {
    static displayName = "@TestLawyerItem";

    render() {

        return (
            <View style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center"
            }}>
                <LawyerItem
                    source='https://cdn.icon-icons.com/icons2/1146/PNG/512/1486485564-add-character-include-more-person-user_81147.png'
                >
                </LawyerItem>
            </View>
        );
    }

}

const _styles = {
};

export default TestLawyerItem;

