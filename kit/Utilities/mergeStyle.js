"use strict";
/**
* @flow
* @todo: Hàm chuyển merge mảng style thành 1 object
* @author: croco
* @since: 20-1-2017
* @param array style
* @return object
*/
const mergeStyle = (...styles) => [...styles].reduce((acc, val) => {
	
	if (Array.isArray(acc)) {

		acc = acc.reduce((s, v) => {

			if (typeof v === "object" && !Array.isArray(v)) {

				return Object.assign({}, s, v);
			}
			return s;
		});
	}
	
	if (Array.isArray(val)) {

		val = val.reduce((s, v) => {

			if (typeof v === "object" && !Array.isArray(v)) {

				return Object.assign({}, s, v);
			}
			return s;
		});
		return Object.assign({}, acc, val);
	} else if (typeof val === "object") {

		return Object.assign({}, acc, val);
	} else if( typeof val === "number" ) {

		const ReactNativePropRegistry = require("ReactNativePropRegistry");
		val = ReactNativePropRegistry.getByID(val) || {};

		return Object.assign({}, acc, val);
	}

	return acc;
});

export default mergeStyle;