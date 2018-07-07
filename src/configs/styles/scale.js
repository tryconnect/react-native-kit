import { PixelRatio, Dimensions, Platform } from 'react-native';

// https://stackoverflow.com/questions/34837342/font-size-on-iphone-6s-plus
// https://github.com/react-native-training/react-native-elements/pull/68/commits/002c3c35b44675706fdde12b5db0c4265d85f0a6
// http://dpi.lv/
// https://facebook.github.io/react-native/docs/pixelratio.html
var scale = 1;

// c1:
//const pixelRatio = PixelRatio.get();
//const deviceHeight = Dimensions.get('window').height;

// if (deviceHeight === 667) {

// 	scale = 1.2;
// } else if (deviceHeight === 736) {

// 	scale = 1.4;
// } else if (pixelRatio != 2) {

// 	scale = 1.15;
// }

// c2:
// if(PixelRatio.get() != 2) {
// 	scale = 1.15;
// } 

// c3:
const getScale = () => {

    const pixelRatio = PixelRatio.get();
    const deviceHeight = Dimensions.get('window').height;
    const deviceWidth = Dimensions.get('window').width;

    switch (pixelRatio) {

        case 2:
            // iphone 5s and older Androids
            if (deviceWidth < 360) {

                return 0.95;
            }

            // iphone 5
            if (deviceHeight < 667) {

                return 1;
            }

            // iphone 6-6s
            if (deviceHeight >= 667 && deviceHeight <= 735) {

                return 1.15;
            }

            // older phablets
            return 1.25;

        case 3:

            // catch Android font scaling on small machines
            // where pixel ratio / font scale ratio => 3:3
            if (deviceWidth <= 360) {

                return 1;
            }

            // Catch other weird android width sizings
            if (deviceHeight < 667) {

                return 1.15;
            }

            // catch in-between size Androids and scale font up
            // a tad but not too much
            if (deviceHeight >= 667 && deviceHeight <= 735) {

                return 1.2;
            }

            // catch larger devices
            // ie iphone 6s plus / 7 plus / mi note 等等
            return 1.27;

        case 3.5:

            // catch Android font scaling on small machines
            // where pixel ratio / font scale ratio => 3:3
            if (deviceWidth <= 360) {

                return 1;
            }

            // Catch other smaller android height sizings
            if (deviceHeight < 667) {

                return 1.20;
            }

            // catch in-between size Androids and scale font up
            // a tad but not too much
            if (deviceHeight >= 667 && deviceHeight <= 735) {

                return 1.25;
            }

            // catch larger phablet devices
            return 1.40;

        default:
            return 1;
    }
};
scale = Platform.select({
    ios: 1,
    android: getScale(),
});

export default (target) => {

    if( typeof target === "object" ) {
        
        for (let key in target) {
            if (target.hasOwnProperty(key)) {
                target[key] = target[key] * scale;
            }
        }
        return target;
    }

    return target * scale;
};