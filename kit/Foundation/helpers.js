export const app = (abstract) => {
    
    const container = require("../Container/Container").default.getInstance();
    if (abstract !== undefined) {

        return container.make(abstract);
    }

    return container;
};

export const response = (provider, props = {}) => {

    const container = require("../Container/Container").default.getInstance();
    
    const response = container.make("response");
    response.setProvider(provider);
    response.setProps(props);
    
    return response.send();
};