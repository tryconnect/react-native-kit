export default (key) => ((state = {
    counter: 1
}, action) => {

    switch (action.type) {
        case `${key}#set`:
            
            return {
                ...state,
                counter: action.payload
            };
            break;
    
        default:
            break;
    }
    return state;
});