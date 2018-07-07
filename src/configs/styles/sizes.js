import scale from './scale';

// kích thước các layout: margin, spacing,...
export const layout = {
    margin: scale(10),
    // khoản cách
    spacing: scale(5),

    // size Icon Service Item
    iconServiceItem: scale(40),
    // size WishButton,
    wishButtonSize: scale(20)
};

// kích thước các border
export const border = {

    // borer Các row
    rowItemBorderBottom: scale(3)
};

// các kích thước input
export const input = {
    height: scale(30),

    // radio
    radioSize: scale(20),
    radioBorder: scale(2),

    // border check box
    borderWidth: scale(2)
};

export default {
    layout,
    border,
    input
};