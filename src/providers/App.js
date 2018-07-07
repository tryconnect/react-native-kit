import ServiceProvider from '~/kit/Support/ServiceProvider';

class AppServiceProvider extends ServiceProvider {

    register() {


    }

    async boot() {

        // response(require("~/navigators").default);
        response(require("~/application").default);
        // response(require("~/tests/Wish").default);
        // response(require("~/tests/Radio").default);
        // response(require("~/tests/RowItem").default);
        // response(require("~/tests/CategoryItem").default);
        // response(require("~/tests/LawyerItem").default);
        // response(require("~/tests/CheckBox").default);
        // response(require("~/tests/Rating").default);
        // response(require("~/tests/Avatar").default);
        // response(require("~/tests/Share").default);
        // response(require("~/tests/Header").default);
    }
}

export default AppServiceProvider;