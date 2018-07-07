// tone màu chính của app
export const primaryTone = 19;
// tone màu background của app
export const backgroundTone = 223;
// tone màu logo
export const logoTone = 223;

// màu chữ
export const text = {
    ServiceItem: "#fff",
    // màu chữ bình thường
    normal: `hsl(${primaryTone}, 0%, 35%)`,
    // màu chữ in đậm
    bold: `hsl(${primaryTone}, 0%, 0%)`,
    // màu chữ in nghiên
    italic: `hsl(${primaryTone}, 0%, 55%)`,
    // màu chữ khi trên nền tối
    sinkingNormal: `hsl(${primaryTone}, 100%, 100%)`,
    sinkingBold: `hsl(${primaryTone}, 100%, 100%)`,
    // màu title Header
    title: `hsl(${primaryTone},80%,50%)`,
};

// màu icon
export const icon = {

    // màu icon trên navigation bar màn hình gọi
    callNavigationBarIcon: `hsl(${primaryTone}, 100%, 98%)`,
    // màu trạng thái kết nối thấp
    callCellularBad: "#f44336",
    // màu trạng thái kết nối trung bình
    callCellularNormal: "#ef5221",
    // màu trạng thái kết nối tốt
    callCellularGood: "#3c8a3f",
    // màu icon khi trên nền tối
    sinkingNormal: `hsl(${primaryTone}, 100%, 100%)`,
    // màu icon bình thường
    normal: `hsl(${primaryTone}, 0%, 35%)`,
};

// màu border
export const border = {

    // màu border các row
    rowItemBorderBottomColor: `hsl(${primaryTone}, 0%, 80%)`,

    // call
    callAvatarShadow: `hsl(${backgroundTone}, 100%, 100%)`,
    normal: `hsl(${primaryTone}, 0%, 35%)`,
};

// màu loading
export const progress = {
    // màu của loading
    activityIndicator: `hsl(${primaryTone}, 94%, 63%)`,
};

// màu các box
export const section = {

    // color categoryItem
    categoryItemActiveBackgroundColor: `hsl(${backgroundTone}, 100%, 90%)`,
    categoryItemBackgroundColor: `hsl(${backgroundTone}, 100%, 98%)`,

    // màu trạng thái online
    onlineStatus: `hsl(${backgroundTone}, 100%, 35%)`,
    // màu trạng thái offline
    offlineStatus: `hsl(${backgroundTone}, 0%, 85%)`,

    // màu nền màn hình gọi thoại
    callBackground: `hsl(${backgroundTone}, 100%, 20%)`,
    callPopupBackground: `hsl(${backgroundTone}, 100%, 100%)`,
    // màn nền thanh điều hướng màn hình gọi thoại
    callNavigatorBackground: `hsla(${backgroundTone}, 100%, 90%, 0.2)`,
    // màu nền avatar trong gọi thoại
    callAvatarBackground: `hsla(${backgroundTone}, 100%, 96%, 0.9)`,
    // màu nền nút chấp nhận cuộc gọi
    callAcceptButtonBackground: "green",
    // màu nền nút huỷ cuộc gọi
    callDeclineButtonBackground: "red",
    // màu nền khi lỗi
    errorBackground: "red",
    warningBackground: "orange",
    successBackground: "green",
};

// màu khung
export const panel = {
    // màu khung serviceItem trạng thái bình thường
    serviceItemBackgroundColor: `hsl(${primaryTone}, 90%, 54%)`,
    // màu khung serviceItem trạng thái actived
    serviceItemActivedBackgroundColor: `hsl(${primaryTone}, 71%, 46%)`,
    // màu khung giá serviceItem
    serviceItemPriceBackgroundColor: `hsl(${logoTone}, 54%, 29%)`
};

// màu các input
export const input = {

    // color rating
    activeColor: '#f0681e',
    inactiveColor: '#737373',

    // màu placeholder của input
    placeholder: `hsl(${primaryTone}, 0%, 62%)`,
    // màu khi select text trong input
    selectionColor: `hsl(${primaryTone}, 100%, 50%)`,
    // màu chữ trong input
    textColor: `hsl(${primaryTone}, 0%, 35%)`,
    // màu chữ label
    labelColor: `hsl(${primaryTone}, 0%, 35%)`,
    // màu chữ khi highlight
    highlightColor: `hsl(${primaryTone}, 100%, 65%)`,
    // màu border input
    borderColor: `hsl(${primaryTone}, 0%, 65%)`,
    // màu background
    backgroundColor: `hsl(${backgroundTone}, 100%, 100%)`,
    // màu checked input
    checkedColor: `hsl(${primaryTone}, 100%, 50%)`,
    // màu underline trên android
    underlineColorAndroid: "transparent"
};

// màu của các nút
export const button = {
    // độ trong suốt khi click
    activeOpacity: 0.5,
    // màu hiệu ứng click button
    rippleColor: `hsl(${primaryTone}, 99%, 30%)`,
    // độ trong suốt của hiệu ứng
    rippleOpacity: 0.3,
    // màu wishbutton
    wishButtonColor: `hsl(${primaryTone}, 87%, 69%)`,
    wishButtonDisable: 'grey',
};

export default {
    text,
    border,
    progress,
    section,
    panel,
    input,
    button,
    icon
};