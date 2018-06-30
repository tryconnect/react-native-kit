// hàm so sánh 2 giá trị có bằng nhau không
// cho phép null === "" === undefined === NaN !== 0
export default (a, b) => !((a !== b) && (!!a | !!b)) && !!(a !== 0 & b !== 0);