import React from 'react';
import { View } from 'react-native';
import Share from '../src/components/Share';

class TestShare extends React.Component {
    static displayName = "@TestShare";

    render() {
        
        return (
            <View style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center"
            }}>
                <Share
                    title="tiêu đề"
                    description="trích dẫn"
                    link="http://google.com"
                    emailSubject="tiêu đề email"
                    emailBody="Nội dung email"
                >
                </Share>
            </View>
        );
    }

}

const _styles = {
};

export default TestShare;

