import createIconSet from 'react-native-vector-icons/lib/create-icon-set';
import glyphMap from './glyphmaps/Custom';
import { Platform } from 'react-native';

let fontName = Platform.OS === "ios" ? "icomoon" : "Custom";

const iconSet = createIconSet(glyphMap, fontName, 'Custom.ttf');

export default iconSet;

export const Button = iconSet.Button;
export const TabBarItem = iconSet.TabBarItem;
export const TabBarItemIOS = iconSet.TabBarItemIOS;
export const ToolbarAndroid = iconSet.ToolbarAndroid;
export const getImageSource = iconSet.getImageSource;