class RegisterProviders {

    async bootstrap (app) {

        return await app.registerConfiguredProviders();
    };
}

export default RegisterProviders;