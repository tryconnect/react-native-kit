import React from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import { colors, fontSizes, scale, sizes } from '~/configs/styles';
import ImageCache from '~/kit/Components/ImageCache';
import Text from '~/components/Text';
import TouchableOpacity from '~/components/TouchableOpacity';
import shallowEqual from 'fbjs/lib/shallowEqual';

class CategoryItem extends React.Component {

    static displayName = "@CategoryItem";

    static propTypes = {
        icon: PropTypes.string,
        name: PropTypes.string,
        label: PropTypes.string,
        actived: PropTypes.bool,
        disabled: PropTypes.bool,
        onActiveChange: PropTypes.func
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
            icon,
            name,
            label,
            disabled,
            onActiveChange,
            ...otherProps
        } = this.props;

        return (
            <TouchableOpacity
                {...otherProps}
                disabled = {disabled}
                onPress  = {this._onActiveChange}
                style    = {[
                    _styles.wrapper,
                    this.state.actived && _styles.inactive
                ]}
            >
                <View style={_styles.container}>
                    <ImageCache
                        style  = {_styles.image}
                        source = {{ uri: icon }}
                    />
                    <Text style={_styles.title}>{name}</Text>
                </View>
                <Text style={_styles.label}>{label}</Text>
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
    wrapper: {
        alignItems: 'center',
        justifyContent: 'center',
        width: scale(200),
        height: scale(150),
        backgroundColor: colors.section.categoryItemBackgroundColor,
        padding: sizes.layout.spacing
    },
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
    },
    image: {
        resizeMode: 'contain',
        width: scale(70),
        height: scale(70)
    },
    title: {
        fontSize: fontSizes.normal,
        color: colors.text.bold,
        fontWeight: "bold",
        textAlign: 'center',
        marginTop: sizes.layout.spacing
    },
    label: {
        fontSize: fontSizes.small,
        color: colors.text.italic,
        textAlign: 'center'
    },
    inactive: {
        backgroundColor: colors.section.categoryItemActiveBackgroundColor
    }
};

export default CategoryItem;