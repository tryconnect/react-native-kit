import registerProviders from './registerProviders';
import registerAliases from './registerAliases';

export default async (container, configs) => {
    
    if( typeof configs === "function") {

        configs = await Promise.resolve(configs(container));
    }

    if (configs.providers) {

        registerProviders(container, configs.providers);
    }

    if (configs.aliases) {

        registerAliases(container, configs.aliases);
    }
    return configs;
};