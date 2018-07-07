"use strict";
import React from 'react';
import ServiceItem from '../src/fragments/ServiceItem';
import Icon from 'react-native-vector-icons/FontAwesome';

class TestServiceItem extends React.Component {
    static displayName = "@TestServiceItem";

    render() {

        return (
            <ServiceItem icon={<Icon name="heart" size={40} style={{ color: "pink" }} />} name="Tư vấn hôn nhân" label="1,000,000 vnđ">
            </ServiceItem>
        );
    }

}

const _styles = {
};

export default TestServiceItem;

