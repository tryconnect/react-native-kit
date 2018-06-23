import ServiceProvider from '~/kit/Support/ServiceProvider';

class Test extends ServiceProvider {

    register() {

        console.log("register test 2");
        this.app.register(require("./Test3").default);
    }
    
    boot() {
        
        console.log("boot test 2");
    }

    provides() {

        return [
            // require("./Test3").default
        ]
    }
}

export default Test;