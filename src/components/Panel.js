import React from 'react';
import { View, Text } from 'react-native';
import PropTypes from 'prop-types';
import { fontSizes, sizes, colors, scale } from '~/configs/styles';

export default class Panel extends React.PureComponent {

	static displayName = '@PanelSharing';

	static propTypes = {
		header: PropTypes.oneOfType([ // tiêu đề
			PropTypes.number,
			PropTypes.element,
			PropTypes.string
		]),
		children: PropTypes.node,// nội dung
        style: PropTypes.object,
		borderRadius: PropTypes.number, // bo góc
		borderColor : PropTypes.string, // màu border
		borderWidth : PropTypes.number, // độ rộng của border
		headerBackgroundColor : PropTypes.string, // màu nền của header
        headerStyle: PropTypes.object,
        headerTextStyle: PropTypes.object
	};

	static defaultProps = {
		header : null,
		children : null
	};

	render() {

		const { 
			header,
			children,
			style,
			borderRadius,
			borderColor,
			borderWidth,
            headerStyle,
            headerTextStyle,
			headerBackgroundColor
        } = this.props;
        
		let contentStyle;
		if (header) {
            
			contentStyle = {
                borderTopLeftRadius: 0,
                borderTopRightRadius: 0,
				borderTopWidth: 0
			};
        }

        let borderColorStyle = !!borderColor && {
            borderColor
        };
        
		return (
			<View style={_styles.container}>
                {
                    !!header && 
                        <View style={[
                            _styles.header, 
                            headerStyle, 
                            !!headerBackgroundColor && {
                                backgroundColor : headerBackgroundColor
                            },
                            borderColorStyle,
                            !!borderRadius && {
                                borderTopLeftRadius: borderRadius,
                                borderTopRightRadius: borderRadius
                            },
                            !!borderWidth && {
                                borderWidth
                            }
                        ]}>
                            {
                                (typeof header === "string" || typeof header === "number") ?
                                    <Text style={[_styles.headerText, headerTextStyle]}>{header}</Text>
                                : header
                            }
                        </View>
                }
				<View
                    style = {[
                        _styles.content, 
                        contentStyle,
                        style,
                        borderColorStyle,
                        !!borderRadius && {
                            borderTopLeftRadius: header ? 0 : borderRadius,
                            borderTopRightRadius: header ? 0 : borderRadius,
                            borderBottomLeftRadius: borderRadius,
                            borderBottomRightRadius: borderRadius
                        },
                        !!borderWidth && {
                            borderTopWidth: header ? 0 : borderWidth,
                            borderLeftWidth: borderWidth,
                            borderRightWidth: borderWidth,
                            borderBottomWidth: borderWidth,
                        }
                    ]}
                >
                    {children}
                </View>
            </View>
		);
	}
}

const _styles = {

    header: {
        padding       : 5 * scale,
        minHeight     : sizes.panelHeaderMinHeight,
		borderWidth         : 1,
		borderColor         : colors.pannelBorderColor,
		borderTopLeftRadius : 5 * scale,
        borderTopRightRadius: 5 * scale,
        paddingHorizontal: 5 * scale,
        paddingVertical: 2 * scale,
        backgroundColor: colors.panelHeaderBackgroundColor

    },
    headerText: {
        color: colors.textSinkingColor,
		fontWeight:'bold',
		fontSize: fontSizes.normal
    },
    content: {
        borderColor: colors.pannelBorderColor,
		minHeight: sizes.panelHeaderMinHeight,
        padding     : 5 * scale,
        borderTopWidth: 0,
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderBottomWidth: 1,
        borderTopLeftRadius: 5 * scale,
        borderTopRightRadius: 5 * scale,
        borderBottomLeftRadius: 5 * scale,
        borderBottomRightRadius: 5 * scale
	}
}; 

