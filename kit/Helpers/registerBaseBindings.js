export default (container) => {

    container.singleton("events", () => {

        return require("../Events/EventEmitter").default;
    });

    container.singleton("registry", () => {

        const Registry = require("../Registry/Registry").default;
        return new Registry("registry");
    });

    container.singleton("splashScreen", () => {

        return null;
    });

    container.singleton("request", () => {

        const Request = require("../Navigation/Request").default;
        return new Request();
    });

    container.singleton("response", () => {

        const Response = require("../Navigation/Response").default;
        return new Response(container.make("splashScreen"));
    });

    container.singleton("kernel", (con) => {
        
        const Kernel = require("../Foundation/Kernel").default;
        return new Kernel(con);
    });
};