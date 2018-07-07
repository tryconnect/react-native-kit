export default (key) => {


    return {
        set(num) {

            return {
                type: `${key}#set`,
                payload: num
            };
        },
        get() {

            return {
                type: `${key}#get`
            }
        }
    };
};