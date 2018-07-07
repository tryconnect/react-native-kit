const {
    initialRouteParams,
    initialRouteName,
    routeConfiguration
} = route("/", {

    "/home": {
        "screen": require("./scenes/Home.scene").default,
        "redux": {
            "reducerOptions": {
                "generateReducer": require("./reducers/test.reducer").default,
                "options": {
                    "persist": true,
                    "generateLogic": require("./logics/test.logic").default
                }
            },
            "containerOptions": {
                "generateActions": require("./actions/test.action").default
            }
        }
    },
    "/profile": require("./scenes/Profile.scene").default,
    "/call": require("./scenes/Call.scene").default,
}, {
    initialRouteName: "/home",
    initialRouteParams: {}
});

export {
    initialRouteParams,
    initialRouteName,
    routeConfiguration
};