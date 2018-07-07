import { setJSExceptionHandler, setNativeExceptionHandler } from 'react-native-exception-handler';
import Application from '~/kit/Foundation/Application';
import { name } from './app';

// registering the error handler (maybe u can do this in the index.android.js or index.ios.js)
setJSExceptionHandler((error, isFatal) => {
    console.log(error)
}, true);

setNativeExceptionHandler((exceptionString) => {
    console.log(exceptionString)
}, false);

try {
    

// khởi tạo app
const app = new Application(name, () => {
    
    return require("./src/application/configs").default;
});

if(__DEV__) {

    app.ignoreWarnings(require("./ignoredYellowBox"));
}

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
} catch (error) {

    console.log(error)
}