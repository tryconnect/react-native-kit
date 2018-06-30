import ServiceProvider from '~/kit/Support/ServiceProvider';

class AppServiceProvider extends ServiceProvider {

    register() {

        
    }

    async boot() {

        // response(require("~/navigators").default);
        response(require("~/application").default);
    }
}

export default AppServiceProvider;