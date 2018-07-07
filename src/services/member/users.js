// đăng nhập
export const login = (params) => {
    
    let token = "";
    if (typeof params === "string") {

        token = params;
    } else {

        token = params.phone_number;
    }

    return Promise.resolve({
        status: 200,
        headers: {
            authorization: "bearer " + token
        },
        data: {
            STATUS: "OK",
            data: {
                phone_number: token,
                token,
                account_id: token,
                active: true,
                name: token
            }
        }
    });
};