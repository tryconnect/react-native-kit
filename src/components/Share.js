import React from 'react';
import PropTypes from 'prop-types';
import Share from 'react-native-share';
import TouchableOpacity from '~/components/TouchableOpacity'
import Icon from 'react-native-vector-icons/FontAwesome';
import { scale, colors } from '~/configs/styles';

class ShareButton extends React.PureComponent {

    static displayName = "@ShareButton";

    static propTypes = {
        title: PropTypes.string,
        description: PropTypes.string,
        link: PropTypes.string.isRequired,
        emailCC: PropTypes.oneOfType([
            PropTypes.array,
            PropTypes.string
        ]),
        emailBody: PropTypes.string,
        emailSubject: PropTypes.string
    };

    render() {

        const {
            title,
            description: message,
            link: url,
            emailCC,
            emailBody,
            emailSubject: subject,
            iconStyle,
            onPress,
            ...otherProps
        } = this.props;

        return (
            <TouchableOpacity 
                {...otherProps}
                onPress={(e) => {
                    onPress && onPress(e);
                    Share.open({
                        url,
                        message,
                        title,
                        subject,
                        failOnCancel: true
                    });
                }}
            >
                <Icon 
                    name  = 'share-alt' 
                    style = {iconStyle || _styles.icon}
                />
            </TouchableOpacity>
        );
    }
}

const _styles = {
    icon: {
        fontSize: scale(20),
        color: colors.text.normal
    }
};

export default ShareButton;