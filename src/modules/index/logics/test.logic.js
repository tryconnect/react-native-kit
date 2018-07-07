export default (key) => {

    return {
        // declarative built-in functionality wraps your code
        type: `${key}#get`, // only apply this logic to this type
        cancelType: `${key}#cancel`, // cancel on this type
        latest: true, // only take latest

        processOptions: {
            // optional since the default is true when dispatch is omitted from
            // the process fn signature
            dispatchReturn: true, // use returned/resolved value(s) for dispatching
            // provide action types or action creator functions to be used
            // with the resolved/rejected values from promise/observable returned
            successType: `${key}#success`, // dispatch this success act type
            failType: `${key}#fail`, // dispatch this failed action type
        },

        // Omitting dispatch from the signature below makes the default for
        // dispatchReturn true allowing you to simply return obj, promise, obs
        // not needing to use dispatch directly
        process({ getState, action }) {
            
            console.log('logic', action)
            return Promise.resolve(113132);
        }
    };
};