import React from 'react';
import { View, Image } from 'react-native';
import PropTypes from 'prop-types';
import { sizes, scale } from '~/configs/styles';
import ImageCache from '~/kit/Components/ImageCache';

export default class Avatar extends React.Component {

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
		onError: PropTypes.func // error image
	};

	static defaultProps = {
		// defaultSource: require(''),
		source: null,
	};

	render() {

		const { defaultSource,
			style,
			onError,
			source,
			...otherProps
		} = this.props;

		return (
			<ImageCache
				style={_styles.container}
				source={source}
				defaultSource={defaultSource}
				downloader={app("downloader.images")}
			>
			</ImageCache>
		);
	}
}

const _styles = {
	container: {
		resizeMode: 'contain',
	}
};

