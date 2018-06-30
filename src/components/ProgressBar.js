"use strict";
import React from 'react';
import PropTypes from 'prop-types';
import {
	Animated,
	Easing,
	View
} from 'react-native';

const INDETERMINATE_WIDTH_FACTOR = 0.3;
const BAR_WIDTH_ZERO_POSITION = INDETERMINATE_WIDTH_FACTOR / (1 + INDETERMINATE_WIDTH_FACTOR);

class ProgressBar extends React.Component {
	static propTypes = {
		animated: PropTypes.bool,
		borderColor: PropTypes.string,
		borderRadius: PropTypes.number,
		borderWidth: PropTypes.number,
		children: PropTypes.node,
		color: PropTypes.string,
		height: PropTypes.number,
		indeterminate: PropTypes.bool,
		onLayout: PropTypes.func,
		progress: PropTypes.number,
		unfilledColor: PropTypes.string,
		width: PropTypes.number
	};

	static defaultProps = {
		animated: true,
		borderRadius: 4,
		borderWidth: 1,
		color: 'rgba(0, 122, 255, 1)',
		height: 20,
		indeterminate: true,
		progress: 0,
		//width: 150
	};

	constructor(props) {
		super(props);

		const progress = Math.min(Math.max(props.progress, 0), 1);

		this.state = {
			width: 0,
			progress: new Animated.Value(props.indeterminate ? INDETERMINATE_WIDTH_FACTOR : progress),
			animationValue: new Animated.Value(BAR_WIDTH_ZERO_POSITION)
		};
	}

	shouldComponentUpdate( nextProps, nextState ) {
		
		return (
			this.state.width !== nextState.width ||
			this.props.height !== nextState.height ||
			this.props.color !== nextState.color ||
			this.props.borderRadius !== nextState.borderRadius ||
			this.props.borderWidth !== nextState.borderWidth ||
			this.props.indeterminate !== nextProps.indeterminate ||
			this.props.progress !== nextProps.progress ||
			this.props.animated !== nextProps.animated
		);
	}

	getSnapshotBeforeUpdate(nextProps, prevState) {

		if (nextProps.indeterminate !== this.props.indeterminate) {

			if (nextProps.indeterminate) {

				this.animate();
			} else {

				Animated.spring(this.state.animationValue, {
					toValue: BAR_WIDTH_ZERO_POSITION,
				}).start();
			}
		}
		if (
			nextProps.indeterminate !== this.props.indeterminate ||
			nextProps.progress !== this.props.progress
		) {

			const progress = (nextProps.indeterminate
				? INDETERMINATE_WIDTH_FACTOR
				: Math.min(Math.max(nextProps.progress, 0), 1)
			);

			if (nextProps.animated) {

				Animated.spring(this.state.progress, {
					toValue: progress,
					bounciness: 0
				}).start();
			} else {

				this.state.progress.setValue(progress);
			}
		}
		return null;
	};

	animate() {

		this.state.animationValue.setValue(0);

		Animated.timing(this.state.animationValue, {
			toValue: 1,
			duration: 1000,
			easing: Easing.linear,
			isInteraction: false
		}).start((endState) => {

			if (endState.finished) {

				this.animate();
			}
		});
	}

	_handleLayout = (event) => {

		if (!this.props.width) {

			this.setState({ width: event.nativeEvent.layout.width });
		}

		this.props.onLayout && this.props.onLayout(event);
	};

	render() {

		const {
			borderColor,
			borderRadius,
			borderWidth,
			children,
			color,
			height,
			style,
			unfilledColor,
			width,
			...restProps
		} = this.props;

		const innerWidth = Math.max(0, width || this.state.width) - (borderWidth * 2);
		const containerStyle = {
			width,
			borderWidth,
			borderColor: borderColor || color,
			borderRadius,
			overflow: 'hidden',
			backgroundColor: unfilledColor
		};
		const progressStyle = {
			backgroundColor: color,
			height,
			transform: [{
				translateX: this.state.animationValue.interpolate({
					inputRange: [0, 1],
					outputRange: [innerWidth * -INDETERMINATE_WIDTH_FACTOR, innerWidth]
				})
			}, {
				translateX: this.state.progress.interpolate({
					inputRange: [0, 1],
					outputRange: [innerWidth / -2, 0]
				})
			}, {
				// Interpolation a temp workaround for https://github.com/facebook/react-native/issues/6278
				scaleX: this.state.progress.interpolate({
					inputRange: [0, 1],
					outputRange: [0.0001, 1]
				})
			}]
		};

		return (
			<View 
				{...restProps}
				style    = {[containerStyle, style]} 
				onLayout = {this._handleLayout} 
			>
				<Animated.View style={progressStyle} />
				{children}
			</View>
		);
	}

	componentDidMount() {
		if (this.props.indeterminate) {
			this.animate();
		}
	}

	componentDidUpdate(nextProps, prevState, snapshot) {

	}
}

export default ProgressBar;