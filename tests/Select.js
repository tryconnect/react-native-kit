import React from 'react';
import Select from '../src/components/Select';

class TestSelect extends React.Component {
    static displayName = "@TestSelect";

    render() {
        return (
            <Select
                success
            >
                <Select.Item label="tấn" value="tan" />
                <Select.Item label="cái" value="cai" />
                <Select.Item label="chuyến" value="chuyen" />
            </Select>
        );
    }

}

const _styles = {
};

export default TestSelect;

