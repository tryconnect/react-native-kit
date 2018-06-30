var id = 0;
export default (target) => {

    let type = typeof target;

    if (
        target === null
        || target === undefined
        || type === "string" 
        || type === "number" 
        || type === "symbol"
        || type === "boolean"
    ) {

        return String(target);
    }

    if (target.__unique_id__) {
        
        return target.__unique_id__;
    }
    
    let key = `${++id}`;
    if (type === "function") {
        
        key = `${
            target.name 
            || target.displayName
            || (target.constructor && target.constructor.name) 
        }-${key}`;
    }
    
    Object.defineProperty(target, '__unique_id__', {
        enumerable: false,
        configurable: false,
        writable: false,
        value: key
    });

    return key;
};