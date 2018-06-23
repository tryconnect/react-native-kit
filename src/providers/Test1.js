import ServiceProvider from '~/kit/Support/ServiceProvider';

class Test extends ServiceProvider {

    // defer = true;
    register() {

        console.log("register test 1");
    }

    boot() {

        console.log("boot test 1");
    }
}

export default Test;