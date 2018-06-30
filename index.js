import Application from '~/kit/Foundation/Application';
import { name } from './app';

// khởi tạo app
const app = new Application(name, () => {
    
    return require("./src/application/configs").default;
});

app.registerHeadlessTask("RNFirebaseBackgroundMessage", () => async (e) => {

    console.log(e);
    return Promise.resolve();
});


// màn hình khởi động
app.bind("splashScreen", () => {

    return require("./src/index").default;
});

// xử lý app
const kernel = app.make("kernel");
const response = kernel.handle(
    app.make("request").capture()
);

response.send();

console.log(app);