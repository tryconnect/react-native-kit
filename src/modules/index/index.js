const {
    initialRouteParams,
    initialRouteName,
    routeConfiguration
} = route("/", {

    "/home": {
        "screen": require("./scenes/Home.scene").default,
        "redux": {
            "reducerOptions": {
                "generateReducer": require("./reducers/test.reducer").default
            },
            "containerOptions": {
                "generateActions": require("./actions/test.action").default
            }
        }
    },
    "/profile": require("./scenes/Profile.scene").default,
}, {
    initialRouteName: "/home",
    initialRouteParams: {}
});

export {
    initialRouteParams,
    initialRouteName,
    routeConfiguration
};