export default (container, aliases = {}) => {

    for (let key in aliases) {

        if (aliases.hasOwnProperty(key)) {

            let alias = aliases[key];
            if (typeof alias === "string") {

                alias = container.make(alias) || alias;
            }
            container.alias(key, alias);
        }
    }
};