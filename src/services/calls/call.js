const domain = `http://iura.itvina.com/api`;

export const refreshToken = (params = {}) => {

    return axios({
        url: `/login`,
        baseURL: domain,
        method: "POST",
        params
    });
};