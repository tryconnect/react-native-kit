import registerProviders from './registerProviders';
import registerAliases from './registerAliases';

export default async (container, configs) => {
    
    if( typeof configs === "function") {

        configs = await Promise.resolve(configs(container));
    }

    configs = configs || {};

    container.configs = (scope, value) => {

        if (scope === undefined) {

            return configs;
        }

        const setConfig = (key = "", config = {}) => {

            if (config.hasOwnProperty(key)) {

                config[key] = value;
                return value;
            }

            let keys = key.split(".");
            let k = keys.shift();

            if (!keys.length) {

                config[k] = value;
                return value;
            }

            config[k] = {};
            key = keys.join(".");

            return setConfig(key, config[k]);
        };

        if (value !== undefined) {

            return setConfig(scope, configs);
        }

        const getConfig = (key = "", config = {}) => {

            if (config.hasOwnProperty(key)) {

                return config[key];
            }

            let keys = key.split(".");
            let k = keys.shift();

            if (!keys.length) {

                return config[k];
            }

            if (!config.hasOwnProperty(k)) {

                return undefined;
            }

            key = keys.join(".");

            return getConfig(key, config[k]);
        };

        return getConfig(scope, configs);
    };

    if (configs.providers) {

        registerProviders(container, configs.providers);
    }

    if (configs.aliases) {

        registerAliases(container, configs.aliases);
    }
    return configs;
};