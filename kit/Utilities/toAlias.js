"use strict";
/**
* @todo: Hàm chuyển đổi chuổi có dấu thành không dấu và ký tự đặc biệt thành -
* @author: Croco
* @since: 20-9-2016
* @params: String str
* @return: String alias
*/
const _regexAa = /à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g;
const _regexEe = /è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g;
const _regexIi = /ì|í|ị|ỉ|ĩ/g;
const _regexOo = /ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g;
const _regexUu = /ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g;
const _regexYy = /ỳ|ý|ỵ|ỷ|ỹ/g;
const _regexDd = /đ/g;

const _regexAA = /À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g;
const _regexEE = /È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g;
const _regexII = /Ì|Í|Ị|Ỉ|Ĩ/g;
const _regexOO = /Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g;
const _regexUU = /Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g;
const _regexYY = /Ỳ|Ý|Ỵ|Ỷ|Ỹ/g;
const _regexDD = /Đ/g;

const _regexSpl = /!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\;|\'| |\"|\&|\#|\[|\]|~|$|_/g;
const _regexMi = /-+-/g;
const _regexSE = /^\-+|\-+$/g;

export default (str, isURL = true) => {

	if (!str) return '';
	str = str.replace(_regexAa, "a")
		.replace(_regexEe, "e")
		.replace(_regexIi, "i")
		.replace(_regexOo, "o")
		.replace(_regexUu, "u")
		.replace(_regexYy, "y")
		.replace(_regexDd, "d")
		.replace(_regexAA, "A")
		.replace(_regexEE, "E")
		.replace(_regexII, "I")
		.replace(_regexOO, "O")
		.replace(_regexUU, "U")
		.replace(_regexYY, "Y")
		.replace(_regexDD, "D")
	;

	if (isURL) {

		str = str.toLowerCase()
			.replace(_regexSpl, "-")
			.replace(_regexMi, "-")
			.replace(_regexSE, "")
		;
	}

	return str;
};