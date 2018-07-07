import React from 'react';
import { View } from 'react-native';
import CategoryItem from '~/fragments/CategoryItem';

class TestCategoryItem extends React.Component {
    static displayName = "@TestCategoryItem";

    render() {

        return (
            <View style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center"
            }}>
                <CategoryItem
                    icon='https://facebook.github.io/react-native/docs/assets/favicon.png'
                    name='HÔN NHÂN GIA ĐÌNH'
                    label='500đ/phút'
                >
                </CategoryItem>
            </View>
        );
    }

}

const _styles = {
};

export default TestCategoryItem;

