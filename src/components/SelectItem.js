import React from 'react';
import PropTypes from 'prop-types';
import { Picker } from 'react-native';

class SelectItem extends React.Component {

    static displayName = "@SelectItem";

    static propTypes = {
        label: PropTypes.string,
        value: PropTypes.any,
    };

    static defaultProps = {
        value: null
    };

    render() {

        const {
            label,
            value,
        } = this.props;

        return (
            <Picker.Item label={label} value={value} />
        );

    }

}

const _styles = {
};

export default SelectItem;