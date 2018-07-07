"use strict";
import React from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import TouchableOpacity from '~/components/TouchableOpacity';
import { colors, sizes, scale } from '../configs/styles';


export default class TabBar extends React.Component {

    static propTypes = {
        navigation: PropTypes.object,
        disable: PropTypes.bool,
        value: PropTypes.bool
    }

    static defaultProps = {
        diasble: false,
        value: false
    }

    onValueChange = () => {
        this.value = !this.state.check
        this.setState({
            check: !this.state.check
        })
    }

    constructor(props) {
        super(props);
        if (this.props.value === false) {
            this.state = {
                check: false,
            }
        }
        else {
            this.state = {
                check: true,
            }
        }
    }


    render() {
        const {
            value,
            disable,
        } = this.props;
        return (
            <View>
                {
                    !!disable === false
                        ? <TouchableOpacity style={[_styles.container]} onPress={this.onValueChange.bind()}>
                            {
                                this.state.check === true ? <Icon name="ios-bookmark" size={_styles.iconSize} color={_styles.bookmarkColor}> </Icon>
                                    : <Icon name="ios-bookmark-outline" size={_styles.iconSize} color={_styles.bookmarkColor}> </Icon>
                            }
                        </TouchableOpacity>
                        : <TouchableOpacity disabled={true}>
                            {
                                <Icon name="ios-bookmark-outline" size={_styles.iconSize} color={_styles.disable_color}> </Icon>
                            }
                        </TouchableOpacity>
                }
            </View>
        );
    }
}
const _styles = {
    bookmarkColor: colors.button.wishButtonColor,
    iconSize: sizes.layout.wishButtonSize,
    disable_color: colors.button.wishButtonDisable,
    container: {
        width: sizes.layout.wishButtonSize / 2, height: sizes.layout.wishButtonSize
    }
};
