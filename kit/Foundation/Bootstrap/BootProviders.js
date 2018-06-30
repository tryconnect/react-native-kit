class BootProviders {

    async bootstrap(app) {

        try {
            
            await app.loadDeferredProviders();
        } catch (error) {}
        
        return await app.boot();
    };
}

export default BootProviders;