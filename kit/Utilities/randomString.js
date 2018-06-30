"use strict";
/**
* @todo: Hàm random string
* @author: Croco
* @since: 21-9-2016
* @params: Number length, String charSet
* @return: String
*/
const _charSet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

export default (length, charSet = _charSet) => {

	charSet.toString();

	let result = "";
	for (let i = 0; i < length; i++) {

		let Poz = Math.floor(Math.random() * charSet.length);
		result += charSet.substring(Poz, Poz + 1);
	}
	return result;
};