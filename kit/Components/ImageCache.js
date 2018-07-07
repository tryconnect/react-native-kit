"use strict";
import React from 'react';
// import PropTypes from 'prop-types';
import { View, Image, ActivityIndicator, ImageBackground as BaseImageBackground } from 'react-native';
import shallowEqual from 'fbjs/lib/shallowEqual';
import mergeStyle from '../Utilities/mergeStyle';

const ImageBackground = BaseImageBackground || Image;

class ImageCache extends React.Component {

    static displayName = "@ImageCache";

    // static propTypes = {
    //     ...Image.propTypes,
    //     animating: ActivityIndicator.propTypes.animating,
    //     loadingColor: ActivityIndicator.propTypes.color,
    //     loadingSize: ActivityIndicator.propTypes.size,
    //     hidesWhenStopped: ActivityIndicator.propTypes.hidesWhenStopped,

    //     source: Image.propTypes.source,

    //     onProgress: PropTypes.func,
    //     downloader: PropTypes.object.isRequired,

    //     fadeDuration: PropTypes.number,
    //     disableLoading: PropTypes.bool,
    //     onRef: PropTypes.func
    // };

    static defaultProps = {
        source: null,
        errorSource: null,
        loadingIndicatorSource: null,
        defaultSource: null,
        fadeDuration: 200,
        disableLoading: false
    };

    constructor(props) {
        super(props);

        this.state = {
            source: (
                props.source
                || props.loadingIndicatorSource
                || props.defaultSource
                || props.errorSource
            ),
            loading: false
        };

        this._requestDownload = null;
        this._maxError = 4;
    }

    static getDerivedStateFromProps(props, prevState) {

        let currentUri = getUrl(prevState.source);
        let sourceUri = getUrl(props.source);
        let defaultUri = getUrl(props.defaultSource);
        let errorUri = getUrl(props.errorSource);
        let loadingUri = getUrl(props.loadingIndicatorSource);

        if( 
            currentUri !== sourceUri
            && currentUri !== defaultUri
            && currentUri !== errorUri
            && currentUri !== loadingUri
        ) {

            return {
                source: (
                    props.source
                    || props.loadingIndicatorSource
                    || props.defaultSource
                    || props.errorSource
                ),
                loading: false,
                errorCounter: 0
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
            disableLoading,
            onRef,
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
                    ref                    = {onRef}
                >
                    {children}
                </Component>
                {
                    this.state.loading && !disableLoading &&
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
            
            let uri = getUrl(this.props.source) 
                || getUrl(this.props.defaultSource)
                || getUrl(this.props.errorSource)
                || getUrl(this.props.loadingIndicatorSource)
            ;
            uri && this.download(uri);
        }
    }

    getSnapshotBeforeUpdate(prevProps) {

        if (this.props.downloader) {

            if (
                this.props.source !== prevProps.source
                || this.props.defaultSource !== prevProps.defaultSource
                || this.props.errorSource !== prevProps.errorSource
                || this.props.loadingIndicatorSource !== prevProps.loadingIndicatorSource
            ) {
    
                let uri = getUrl(this.props.source) 
                    || getUrl(this.props.defaultSource)
                    || getUrl(this.props.errorSource)
                    || getUrl(this.props.loadingIndicatorSource)
                ;
                
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
                || this.props.errorSource
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
                source: {
                    uri: url
                }
            });

            this._onError({
                nativeEvent: error
            });
        }
    };

    _onError = (e) => {

        let errorSource = null;
        
        switch (this.state.source) {

            case this.props.loadingIndicatorSource:
                
                errorSource = this.props.source;
                break;

            case this.props.source:
                
                errorSource = this.props.defaultSource;
                break;

            case this.props.defaultSource:
                
                errorSource = this.props.errorSource;
                break;

            case this.props.errorSource:
                
                errorSource = null;
                break;

            default:

                let currentUri = getUrl(this.state.source);
                let sourceUri = getUrl(this.props.source);
                let defaultUri = getUrl(this.props.defaultSource);
                let errorUri = getUrl(this.props.errorSource);
                let loadingUri = getUrl(this.props.loadingIndicatorSource);

                let url = null;
                let source = null;

                switch (currentUri) {

                    case sourceUri:
                        
                        url = defaultUri || errorUri || loadingUri;
                        source = this.props.defaultSource || this.props.errorSource || this.props.loadingIndicatorSource;
                        break;

                    case defaultUri:
                        
                        url = errorUri || loadingUri;
                        source = this.props.errorSource || this.props.loadingIndicatorSource;
                        break;

                    case errorUri:

                        url = loadingUri;
                        source = this.props.loadingIndicatorSource;
                        break;
                        
                    case loadingUri:
                        
                        url = null;
                        source = null;
                        break;
                }

                if (url) {

                    return this.download(url);
                }
                errorSource = source;
                break;
        }

        if( this.state.errorCounter > this._maxError ) {

            this.setState({
                source: errorSource,
                loading: false
            });
            return;
        }

        this.setState({
            source: errorSource,
            loading: false,
            errorCounter: this.state.errorCounter + 1
        });

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
            
            throw new Error("downloader has not been initialized");
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
        this._requestDownload = undefined;

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
    if (source && typeof source === "object" && REGX_URL.test(source.uri)) {

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