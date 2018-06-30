import React from 'react';
import PropTypes from 'prop-types';
import { View, TextInput, TouchableOpacity } from 'react-native';
import { colors, scale } from '~/configs/styles';
import Icon from 'react-native-vector-icons/Ionicons';

class SearchBar extends React.Component {

    static displayName = "@SearchBar";

    static propTypes = {
        goBack: PropTypes.func
    };

    constructor(props) {
        super(props);
        this.state = { text: '' };
    }

    render() {

        const {
            goBack
        } = this.props;

        return (
            <View style={_styles.container}>
                {
                    !!goBack &&
                    <TouchableOpacity style={_styles.touchIcon}>
                        <Icon style={_styles.iconSearch} name="ios-arrow-round-back" />
                    </TouchableOpacity>
                }
                <TextInput style={[_styles.input, !goBack && _styles.inputPadding]}
                    onChangeText={(text) => this.setState({ text })}
                    value={this.state.text}
                    placeholder='Tìm kiếm...'
                    underlineColorAndroid='transparent'
                />
                <TouchableOpacity style={_styles.touchIcon}>
                    <Icon style={_styles.iconSearch} name="ios-search-outline" />
                </TouchableOpacity>
            </View>
        );

    }

}

const _styles = {
    container: {
        borderWidth: 1 * scale,
        borderColor: colors.pannelBorderColor,
        borderRadius: 5 * scale,
        alignItems: "center",
        flexDirection: 'row',
    },
    touchIcon: {
        width: 40 * scale,
        height: 40 * scale,
        justifyContent: "center",
        alignItems: "center"
    },
    input: {
        flex: 1,
        height: 40 * scale,
    },
    iconGoBack: {
        fontSize: 30,
    },
    iconSearch: {
        fontSize: 20,
    },
    inputPadding: {
        paddingLeft: 10 * scale,
    }
};

export default SearchBar;