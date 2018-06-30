"use strict";
import React from 'react';
// import PropTypes from 'prop-types';
import { View, Image, ActivityIndicator, ImageBackground as BaseImageBackground } from 'react-native';
import shallowEqual from 'fbjs/lib/shallowEqual';
import mergeStyle from '../Utilities/mergeStyle';

const ImageBackground = BaseImageBackground || Image;

class ImageCache extends React.Component {

    static displayName = "@ImageCache";

    static propTypes = {
        // ...Image.propTypes,
        // animating: ActivityIndicator.propTypes.animating,
        // loadingColor: ActivityIndicator.propTypes.color,
        // loadingSize: ActivityIndicator.propTypes.size,
        // hidesWhenStopped: ActivityIndicator.propTypes.hidesWhenStopped,

        // source: Image.propTypes.source,

        // onProgress: PropTypes.func,
        // downloader: PropTypes.object.isRequired,

        // fadeDuration: PropTypes.number
    };

    static defaultProps = {
        source: null,
        errorSource: null,
        loadingIndicatorSource: null,
        defaultSource: null,
        fadeDuration: 200
    };

    constructor(props) {
        super(props);

        this.state = {
            source: (
                props.source
                || props.defaultSource
                || props.loadingIndicatorSource
                || props.errorSource
            ),
            loading: false
        };

        this._requestDownload = null;
    }

    static getDerivedStateFromProps(props, prevState) {

        if (props.source !== prevState.source) {

            return {
                source: (
                    props.source
                    || props.defaultSource
                    || props.loadingIndicatorSource
                    || props.errorSource
                ),
                loading: false
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
            style,
            source,
            errorSource,
            loadingIndicatorSource,
            defaultSource,
            children,
            animating,
            loadingSize,
            loadingColor,
            hidesWhenStopped,
            ...otherProps
        } = this.props;

        const Component = children ? ImageBackground : Image;

        let containerStyle = mergeStyle(_styles.container, style);
        let imageStyle = {
            width: "100%",
            height: "100%"
        };

        for (let key in imagesCssProps) {
            if (imagesCssProps.hasOwnProperty(key)) {
                let prop = imagesCssProps[key];
                imageStyle[prop] = containerStyle[prop];
            }
        }

        for (let key in removeCssProps) {
            if (removeCssProps.hasOwnProperty(key)) {
                let prop = imagesCssProps[key];
                delete containerStyle[prop];
                if (Component === ImageBackground) {
                    delete imageStyle[prop];
                }
            }
        }

        return (
            <View style={containerStyle}>
                <Component
                    {...otherProps}
                    style                  = {imageStyle}
                    source                 = {this.state.source}
                    loadingIndicatorSource = {loadingIndicatorSource}
                    defaultSource          = {defaultSource}
                    onError                = {this._onError}
                    onLoadStart            = {this._onLoadStart}
                    onLoadEnd              = {this._onLoadEnd}
                >
                    {children}
                </Component>
                {
                    this.state.loading &&
                        <ActivityIndicator
                            style            = {_styles.loading}
                            animating        = {animating}
                            color            = {loadingColor}
                            size             = {loadingSize}
                            hidesWhenStopped = {hidesWhenStopped}
                        />
                }
            </View>
        );
    }

    componentDidMount() {

        if (this.props.downloader) {
            
            let uri = getUrl(this.props.source) || getUrl(this.props.defaultSource);
            this.download(uri);
        }
    }

    getSnapshotBeforeUpdate(prevProps) {

        if (this.props.downloader) {

            if (
                this.props.source !== prevProps.source
                || this.props.defaultSource !== prevProps.defaultSource
            ) {
    
                let uri = getUrl(this.props.source) || getUrl(this.props.defaultSource);
                
                if (uri && uri != getUrl(this.state.source)) {
    
                    return uri;
                }
            }
        }

        return null;
    }

    componentDidUpdate(prevProps, prevState, snapshot) {

        if (snapshot) {

            this.download(snapshot);
        }
    }

    componentWillUnmount() {

        this.stopDownload();
    }

    stopDownload = () => {

        this._requestDownload
            && this._requestDownload.cancel
            && this._requestDownload.cancel()
        ;
    };

    download = async (url, configs = {}) => {

        this.setState({
            loading: true,
            source: (
                this.props.loadingIndicatorSource
                || this.props.defaultSource
            )
        });

        try {
            let uri = await this._download(url, configs);

            this.setState({
                loading: false,
                source: {
                    uri
                }
            });
        } catch (error) {

            this.setState({
                loading: false,
                source: (
                    this.props.source
                    || this.props.defaultSource
                    || this.props.errorSource
                )
            });

            // this._onError({
            //     nativeEvent: error
            // });
        }
    };

    _onError = (e) => {

        let errorSource;
        if (
            this.state.source === this.props.source
            || (
                this.state.source !== this.props.defaultSource
                && this.state.source !== this.props.errorSource
                && this.state.source !== this.props.loadingIndicatorSource
            )
        ) {

            errorSource = this.props.defaultSource || this.props.errorSource;
            this.setState({
                source: errorSource,
                loading: errorSource != null
            });
        } else if (
            this.props.defaultSource 
            && this.state.source === this.props.defaultSource
        ) {

            errorSource = this.props.errorSource;
            this.setState({
                source: errorSource,
                loading: errorSource != null
            });
        } else {

            errorSource = this.props.errorSource || this.props.loadingIndicatorSource;
            this.setState({
                source: errorSource,
                loading: errorSource != null
            });
        }

        this.props.onError && this.props.onError(e);
    };

    _onLoadStart = (e) => {

        this.setState({
            loading: true
        });
        this.props.onLoadStart && this.props.onLoadStart(e);
    };

    _onLoadEnd = (e) => {

        if (!this._requestDownload) {

            this.setState({
                loading: false
            });
        }
        this.props.onLoadEnd && this.props.onLoadEnd(e);
    };

    _download = async (url, configs = {}) => {

        const downloader = this.props.downloader;
        if (!downloader) {

            throw new Error("downloader has not been initialized")
        }

        configs = {
            method: "GET",
            ...configs,
            progress: this.props.onProgress && (({ receivedBytes, totalBytes }) => {

                this.props.onProgress({
                    nativeEvent: {
                        loaded: receivedBytes,
                        total: totalBytes
                    }
                });
            })
        };

        this.stopDownload();

        const cache = downloader.getCache();

        if (cache) {

            try {

                let hasCache = await cache.has(url);
                if (hasCache) {

                    if (cache.isFile()) {

                        return cache.getPath(hasCache);
                    }

                    return await cache.get(hasCache, "base64");
                }
            } catch (error) { }
        }

        this._requestDownload = downloader.download(url, configs);
        const base64 = await this._requestDownload;

        if (cache && cache.isFile()) {

            try {

                let hasCache = await cache.has(url);
                if (hasCache) {

                    return cache.getPath(hasCache);
                }
            } catch (error) { }
        }

        return base64;
    };
}

const imagesCssProps = [
    "resizeMode",
    "borderRadius"
];
const removeCssProps = [
    "resizeMode"
];

const REGX_URL = /https?/;

const getUrl = (source) => {

    if (typeof source === "string" && REGX_URL.test(source)) {

        return source;
    }
    if (typeof source === "object" && REGX_URL.test(source.uri)) {

        return source.uri;
    }
};

const _styles = {
    container: {
        overflow: "hidden",
        justifyContent: "center",
        alignItems: "center"
    },
    loading: {
        position: "absolute",
        zIndex: 1
    }
};

export default ImageCache;