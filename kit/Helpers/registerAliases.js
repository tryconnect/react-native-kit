export default (container, aliases = {}) => {

    for (let key in aliases) {

        if (aliases.hasOwnProperty(key)) {

            let alias = aliases[key];
            container.alias(key, alias);
        }
    }
};