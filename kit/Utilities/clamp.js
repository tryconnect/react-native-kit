"use strict";
/**
 * @todo: Hàm giới hạn value trong khoản min và max ( min < value < max )
 * @author: Croco
 * @since: 5-4-2017
 * @return: value
*/

export default (value: Number = 0, min: Number = 0, max: Number = 0) => (min < max
	? (value < min ? min : value > max ? max : value)
	: (value < max ? max : value > min ? min : value)
);