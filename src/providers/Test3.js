import ServiceProvider from '~/kit/Support/ServiceProvider';

class Test extends ServiceProvider {

    register() {

        console.log("register test 3");
    }
    
    boot() {
        
        console.log("boot test 3");
    }
}

export default Test;