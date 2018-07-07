import React from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import TouchableOpacity from '~/components/TouchableOpacity';
import Avatar from '~/components/Avatar';
import Rating from '~/components/Rating';
import WishButton from '~/components/WishButton';
import Text from '~/components/Text';
import { scale, fontSizes, sizes } from '~/configs/styles';
import shallowEqual from 'fbjs/lib/shallowEqual';

class LawyerItem extends React.Component {

    static displayName = "@LawyerItem";

    static propTypes = {
        source: PropTypes.object.isRequired,
        actived: PropTypes.bool,
        onRatingChange: PropTypes.func,
        onWishChange: PropTypes.func,
        onActiveChange: PropTypes.func,
        disabled: PropTypes.bool
    };

    static defaultProp = {
        actived: false,
        disabled: false
    };

    constructor(props) {
        super(props);

        this.state = {
            actived: props.actived
        };
    }

    static getDerivedStateFromProps(props, prevState) {

        if (props.actived !== prevState.actived) {

            return {
                actived: props.actived
            };
        }
        return null;
    }

    shouldComponentUpdate(nextProps, nextState) {

        return (
            !shallowEqual(this.state, nextState)
            || !shallowEqual(this.props, nextProps)
        );
    }

    render() {

        const {
            source,
            actived,
            onRatingChange,
            onWishChange,
            onActiveChange,
            ...otherProps
        } = this.props;

        return (
            <TouchableOpacity 
                {...otherProps}
                style   = {_styles.container}
                onPress = {this._onActiveChange}
            >
                <Avatar
                    source={source}
                    onlineStatus
                >
                </Avatar>
                <View style={_styles.blockMarginLeft}>
                    <View style={_styles.blockLawyer}>
                        <Text style={_styles.blockLawyerText}>Luật sư </Text>
                        <Text style={[_styles.blockLawyerText, _styles.blockLawyerName]}>Nguyễn Mạnh Vỹ</Text>
                    </View>
                    <Rating>
                    </Rating>
                </View>
                <View style={_styles.wishButton}>
                    <WishButton>
                    </WishButton>
                </View>
            </TouchableOpacity>
        );
    }

    _onActiveChange = (e) => {

        const {
            onPress,
            onActiveChange
        } = this.props;

        onPress && onPress(e);
        if (onActiveChange) {

            return onActiveChange(!this.state.actived);
        }

        this.setState({
            actived: !this.state.actived
        });
    }
}

const _styles = {
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        width: "100%",
        padding: sizes.layout.spacing
    },
    blockMarginLeft: {
        marginLeft: scale(20),
    },
    blockLawyer: {
        flexDirection: 'row',
    },
    blockLawyerText: {
        fontSize: fontSizes.normal,
    },
    blockLawyerName: {
        fontWeight: 'bold',
    },
    wishButton: {
        position: 'absolute',
        top: 0,
        right: 0
    }
};

export default LawyerItem;