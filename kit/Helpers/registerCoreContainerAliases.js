export default (container) => {

    const helpers = require("../Foundation/helpers");
    for (let key in helpers) {

        if (helpers.hasOwnProperty(key)) {

            let helper = helpers[key];
            container.alias(key, helper);
        }
    }
};