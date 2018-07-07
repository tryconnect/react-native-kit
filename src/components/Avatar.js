import React from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import { scale, colors } from '~/configs/styles';
import ImageCache from '~/kit/Components/ImageCache';
import mergeStyle from '~/kit/Utilities/mergeStyle';

class Avatar extends React.PureComponent {

    static displayName = '@Avatar';

    static propTypes = {
        defaultSource: PropTypes.oneOfType([ // hình mặc định
            PropTypes.object,
            PropTypes.number,
            PropTypes.string
        ]),
        source: PropTypes.oneOfType([ // hình
            PropTypes.object,
            PropTypes.number,
            PropTypes.string
        ]),
        style: PropTypes.oneOfType([ // css
            PropTypes.object,
            PropTypes.number,
            PropTypes.array
        ]),
        onlineStatus: PropTypes.bool, // tình trạng online
        downloader: PropTypes.object,
        statusStyle: PropTypes.oneOfType([ // css
            PropTypes.object,
            PropTypes.number,
            PropTypes.array
        ])
    };

    static defaultProps = {
        onlineStatus: null,
        errorSource: require("~/assets/images/noavatar.png"),
        downloader: app("downloader.images")
    };

    render() {

        const {
            onlineStatus,
            style,
            downloader,
            statusStyle,
            ...otherProps,
        } = this.props;

        return (
            <View>
                <ImageCache
                    {...otherProps}
                    style      = {mergeStyle(_styles.avatar, style)}
                    downloader = {downloader}
                >
                </ImageCache>
                {
                    typeof onlineStatus === "boolean" &&
                        <View
                            style={mergeStyle(_styles.online, statusStyle, {
                                backgroundColor: onlineStatus ? colors.section.onlineStatus : colors.section.offlineStatus
                            })}
                        />
                }
            </View>

        );
    }
}

const _styles = {
    avatar: {
        width: scale(50),
        height: scale(50),
        borderRadius: scale(50) / 2,
        resizeMode: "contain"
    },
    online: {
        width: scale(12),
        height: scale(12),
        borderRadius: scale(12) / 2,
        position: 'absolute',
        zIndex: 1,
        bottom: scale(6),
        left: scale(6)
    }
};

export default Avatar;