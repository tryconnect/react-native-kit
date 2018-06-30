import { isReactComponent } from '../../Utilities/componentDetect';

// hàm tạo option screen
const generateOption = (element) => {

    if (isReactComponent(element)) {

        return {
            screen: element
        };
    }

    if (
        typeof element === "object" 
        && element.screen
        && isReactComponent(element.screen)
    ) {

        return element;
    }

    return null;
};

export default ( group, routes = {} ) => {

    let routeConfiguration = {};
    if (isReactComponent(routes)) {

        return routeConfiguration = {
            [group]: {
                screen: routes
            }
        };
    }

    for (let key in routes) {
        if (routes.hasOwnProperty(key)) {
            let element = routes[key];
            
            let routeName = `${group}/${key}`;
            routeName = routeName.replace(/[\/]+/g, "/");
            
            let option = generateOption(element);

            if (option) {

                routeConfiguration[routeName] = option;
            }
        }
    }

    return routeConfiguration;
};