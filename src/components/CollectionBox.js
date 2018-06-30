"use strict";
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import PropTypes from 'prop-types';
import Panel from '~/components/Panel';
import { fontSizes, colors, scale } from '~/configs/styles';

class CollectionBox extends React.Component {

    static displayName = "@CollectionBox";

    static propTypes = {
        header:PropTypes.string,
        children:PropTypes.node,
        moreOnPress:PropTypes.func
    };

    static defaultProps = {
        header:null
    };

    render() {

        const {
            header,
            children,
            moreOnPress,
        } = this.props;
        return (
            <Panel
                header={(
                    <View style={_styles.header}>
                        <Text style={_styles.headerText}>{header}</Text>
                        {
                            !!moreOnPress &&
                                <TouchableOpacity 
                                    onPress       = {moreOnPress}
                                    activeOpacity = {colors.activeOpacity}
                                >
                                    <Text style={_styles.moreLabel}>Xem thêm</Text>
                                </TouchableOpacity>
                        }
                    </View>
                )}
            >
                <View style={_styles.container}>
                    {children}
                </View>
            </Panel>
        );
    }

}
const _styles = {
    container: {
        flex: 1,
        paddingBottom: 10 * scale
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center"
    },
    headerText: {
        color: colors.textSinkingColor,
        fontWeight: "bold",
        fontSize: fontSizes.normal
    },
    moreLabel: {
        fontSize: fontSizes.small,
        color: colors.textSinkingColor
    }

};


export default CollectionBox;