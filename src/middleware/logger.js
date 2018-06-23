"use strict";

import { createLogger } from 'redux-logger';
/**
* @todo: Hàm hỗ trợ tạo middleware log redux
* @author: croco
* @since: 20-1-2017
* @return function
*/
const logger = createLogger ( { 
    predicate: ( getState, action ) => __DEV__, 
    collapsed: true, 
    duration: true,
    timestamp: true
} );
export default logger;