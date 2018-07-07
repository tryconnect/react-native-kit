"use strict";
import React from 'react';
// import PropTypes from 'prop-types';
import { View, Animated } from 'react-native';

class Underline extends React.PureComponent {

    static displayName = "@Underline";

    // static propTypes = {
    //     duration: PropTypes.number,
    //     highlightColor: PropTypes.string,
    //     borderColor: PropTypes.string,
    //     width: PropTypes.number,
    //     lineHeight: PropTypes.number
    //     onRef: PropTypes.func
    // };

    static defaultProps = {
        duration: 300,
        width: 0,
        lineHeight: 1,
        borderColor: "#E0E0E0"
    };

    constructor(props) {
        super(props);

        this.state = {
            lineLength: new Animated.Value(0),
        };
        this.wrapperWidth = props.width;
    }

    expandLine = (callback) => {

        return Animated.timing(this.state.lineLength, {
            toValue: this.wrapperWidth,
            duration: this.props.duration
        }).start(callback);
    };

    shrinkLine = (callback) => {

        return Animated.timing(this.state.lineLength, {
            toValue: 0,
            duration: this.props.duration
        }).start(callback);
    };

    render() {

        const {
            borderColor,
            highlightColor,
            lineHeight,
            width,
            onRef,
            ...otherProps
        } = this.props;

        return (
            <View
                style                  = {[
                    _styles.underlineWrapper, 
                    {
                        backgroundColor: borderColor
                    },
                    lineHeight && {
                        height: lineHeight
                    }
                ]}
                ref                    = "wrapper"
            >
                <Animated.View
                    {...otherProps}
                    ref                = {onRef}
                    style              = {{
                        width          : this.state.lineLength,
                        height         : lineHeight,
                        backgroundColor: highlightColor
                    }}
                >
                </Animated.View>
            </View>
        );
    }

    componentDidMount() {

        requestAnimationFrame(() => {

            if (this.refs.wrapper == null) {
                return;
            }
            const container = this.refs.wrapper;
            container.measure((left, top, width, height) => {

                this.wrapperWidth = width;
            });
        });
    }
}

const _styles = {
    underlineWrapper: {
        height: 1,
        alignItems: 'center'
    }
};

export default Underline;