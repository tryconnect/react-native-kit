"use strict";
import React from 'react';
import Avatar from '../src/components/Avatar';

class TestAvatar extends React.Component {
    static displayName = "@TestAvatar";

    render() {

        return (
            <Avatar
                source='https://reactnativecode.com/wp-content/uploads/2018/01/Error_Img.png'
            >
            </Avatar>
        );
    }

}

const _styles = {
};

export default TestAvatar;

