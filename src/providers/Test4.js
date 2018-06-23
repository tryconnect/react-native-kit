import ServiceProvider from '~/kit/Support/ServiceProvider';

class Test extends ServiceProvider {

    register() {

        console.log("register test 4");
    }

    boot() {

        console.log("boot test 4");
    }
}

export default Test;