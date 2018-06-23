export default (container, providers = []) => {

    for (let key in providers) {

        if (providers.hasOwnProperty(key)) {

            let provider = providers[key];

            container.register(provider);
        }
    }
};